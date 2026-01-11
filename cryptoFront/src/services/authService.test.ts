import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from './authService';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('devrait retourner un token et le sauvegarder', async () => {
      const mockResponse = { token: 'test-token-123' };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authService.login({ email: 'test@test.com', password: 'password123' });

      expect(result.token).toBe('test-token-123');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'test-token-123');
    });

    it('devrait lever une erreur si la réponse est ko', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Identifiants invalides' }),
      });

      await expect(authService.login({ email: 'test@test.com', password: 'wrong' }))
        .rejects.toThrow('Identifiants invalides');
    });

    it('devrait lever une erreur générique si pas de message', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      await expect(authService.login({ email: 'test@test.com', password: 'wrong' }))
        .rejects.toThrow('Erreur lors de la connexion');
    });

    it('devrait gérer les erreurs réseau', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      await expect(authService.login({ email: 'test@test.com', password: 'password' }))
        .rejects.toThrow('Network error');
    });
  });

  describe('register', () => {
    it('devrait retourner les informations utilisateur', async () => {
      const mockResponse = { id: 1, email: 'test@test.com', created_at: '2026-01-11' };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authService.register({ 
        name: 'Test User', 
        email: 'test@test.com', 
        password: 'password123' 
      });

      expect(result.id).toBe(1);
      expect(result.email).toBe('test@test.com');
    });

    it('devrait lever une erreur si email déjà utilisé', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Email déjà utilisé' }),
      });

      await expect(authService.register({ 
        name: 'Test', 
        email: 'test@test.com', 
        password: 'pass' 
      })).rejects.toThrow('Email déjà utilisé');
    });
  });

  describe('saveToken', () => {
    it('devrait sauvegarder le token dans localStorage', () => {
      authService.saveToken('my-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'my-token');
    });
  });

  describe('getToken', () => {
    it('devrait retourner le token depuis localStorage', () => {
      localStorageMock.getItem.mockReturnValue('stored-token');
      const result = authService.getToken();
      expect(result).toBe('stored-token');
    });

    it('devrait retourner null si pas de token', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const result = authService.getToken();
      expect(result).toBeNull();
    });
  });

  describe('removeToken', () => {
    it('devrait supprimer le token de localStorage', () => {
      authService.removeToken();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('isAuthenticated', () => {
    it('devrait retourner true si token existe', () => {
      localStorageMock.getItem.mockReturnValue('token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('devrait retourner false si pas de token', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('logout', () => {
    it('devrait supprimer le token', () => {
      authService.logout();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });
});
