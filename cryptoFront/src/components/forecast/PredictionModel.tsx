import React from 'react';
import { Brain, TrendingUp, BarChart2 } from 'lucide-react';

interface PredictionModelProps {
  modelType: 'linear' | 'ma' | 'momentum';
}

export function PredictionModel({ modelType }: PredictionModelProps) {
  const models = {
    linear: {
      name: 'Tendance linéaire',
      icon: TrendingUp,
      color: 'blue',
      description: 'Ce modèle extrapole la tendance actuelle de manière linéaire.',
      strengths: [
        'Simple et facile à interpréter',
        'Efficace pour les tendances stables',
        'Peu de calculs nécessaires',
      ],
      weaknesses: [
        'Ne capture pas les retournements de tendance',
        'Sensible aux variations récentes',
        'Moins précis sur le long terme',
      ],
    },
    ma: {
      name: 'Moyenne mobile',
      icon: BarChart2,
      color: 'purple',
      description: 'Utilise la moyenne des variations récentes pour prédire les prix futurs.',
      strengths: [
        'Lisse les variations aléatoires',
        'Capture les tendances moyennes',
        'Réduit l\'impact des pics isolés',
      ],
      weaknesses: [
        'Réagit lentement aux changements',
        'Peut manquer les retournements rapides',
        'Moins efficace dans les marchés volatils',
      ],
    },
    momentum: {
      name: 'Momentum',
      icon: Brain,
      color: 'green',
      description: 'Combine la tendance actuelle avec des facteurs de volatilité.',
      strengths: [
        'Intègre la volatilité du marché',
        'Plus réaliste pour les cryptos',
        'Adaptatif aux changements',
      ],
      weaknesses: [
        'Plus complexe à interpréter',
        'Peut amplifier les erreurs',
        'Nécessite plus de données historiques',
      ],
    },
  };

  const model = models[modelType];
  const Icon = model.icon;

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
  };

  return (
    null
  );
}