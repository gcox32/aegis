'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FormCard, FormTitle
} from '@/components/ui/Form';
import { CreateEditForm } from '@/components/ui/CreateEditForm';
import { Meal, PortionedFood, Food, Macros, Micros } from '@/types/fuel';
import { MealFormData, PortionedFoodFormData } from './types';
import { MealFormFields } from './MealFormFields';
import { calculateNutrients, aggregateNutrients } from '@/lib/fuel/calculations';

interface MealFormProps {
  mealId?: string;
  isEditing?: boolean;
}

export default function MealForm({ mealId, isEditing = false }: MealFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialMeal, setInitialMeal] = useState<Meal | null>(null);
  const [loadingMeal, setLoadingMeal] = useState(isEditing);

  const [formData, setFormData] = useState<MealFormData>({
    name: '',
    description: '',
  });

  const [portionedFoods, setPortionedFoods] = useState<PortionedFoodFormData[]>([]);

  useEffect(() => {
    if (!isEditing || !mealId) {
      setLoadingMeal(false);
      return;
    }

    let cancelled = false;

    async function loadMeal() {
      try {
        const res = await fetch(`/api/fuel/meals/${mealId}`);
        if (!res.ok) {
          throw new Error('Failed to load meal');
        }
        const meal = await res.json();
        if (cancelled || !meal) return;

        setInitialMeal(meal);
        setFormData({
          name: meal.name || '',
          description: meal.description || '',
        });

        // Load portioned foods
        try {
          const portionsRes = await fetch(`/api/fuel/meals/${mealId}/portions`);
          if (portionsRes.ok) {
            const data = await portionsRes.json();
            const portions = data.portions || [];
            if (Array.isArray(portions)) {
              // Fetch food names for each portion
              const portionedFoodsData = await Promise.all(
                portions.map(async (pf: PortionedFood, index: number) => {
                  let foodName = '';
                  if (pf.foodId) {
                    try {
                      const foodRes = await fetch(`/api/fuel/foods/${pf.foodId}`);
                      if (foodRes.ok) {
                        const food = await foodRes.json();
                        foodName = food.name || '';
                      }
                    } catch (err) {
                      console.error('Failed to fetch food name', err);
                    }
                  }
                  return {
                    clientId: `portion-${index}-${Date.now()}`,
                    foodId: pf.foodId,
                    foodName,
                    portion: pf.portion,
                  };
                })
              );
              setPortionedFoods(portionedFoodsData);
            }
          }
        } catch (err) {
          console.error('Failed to load portions', err);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load meal');
      } finally {
        setLoadingMeal(false);
      }
    }

    loadMeal();
    return () => {
      cancelled = true;
    };
  }, [isEditing, mealId]);

  const handleDelete = async () => {
    if (!mealId) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/fuel/meals/${mealId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete meal');
      router.push('/fuel/build/meals');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Calculate nutrients for each portioned food
      const nutrientMap = new Map<string, { calories?: number; macros?: Macros; micros?: Micros }>();
      for (const portionedFood of portionedFoods) {
        if (portionedFood.foodId) {
          try {
            // Fetch the food data to get its nutritional info
            const foodRes = await fetch(`/api/fuel/foods/${portionedFood.foodId}`);
            if (foodRes.ok) {
              const food: Food = await foodRes.json();
              // Calculate nutrients for this portion
              const nutrients = calculateNutrients(food, portionedFood.portion);
              nutrientMap.set(portionedFood.foodId, nutrients);
            }
          } catch (err) {
            console.error(`Failed to fetch food ${portionedFood.foodId}:`, err);
          }
        }
      }

      // Aggregate all nutrients to get meal totals
      const nutrientHolders = Array.from(nutrientMap.values());
      const mealTotals = aggregateNutrients(nutrientHolders);

      // Include calculated totals in meal data
      const mealDataWithTotals = {
        ...formData,
        calories: mealTotals.calories,
        macros: mealTotals.macros,
      };

      const url = isEditing && mealId
        ? `/api/fuel/meals/${mealId}`
        : '/api/fuel/meals';

      const method = isEditing ? 'PATCH' : 'POST';

      // First create/update the meal
      const mealRes = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealDataWithTotals),
      });

      if (!mealRes.ok) {
        const data = await mealRes.json();
        throw new Error(data.error || 'Failed to save meal');
      }

      const savedMeal = await mealRes.json();
      const savedMealId = savedMeal.id || mealId;

      // Then handle portioned foods
      if (savedMealId) {
        if (isEditing) {
          // Get existing portions
          const existingRes = await fetch(`/api/fuel/meals/${savedMealId}/portions`);
          const existingData = existingRes.ok ? await existingRes.json() : { portions: [] };
          const existingPortions = existingData.portions || [];
          const existingIds = existingPortions.map((p: PortionedFood) => p.id);

          // Delete all existing portions (we'll recreate them)
          for (const existingId of existingIds) {
            await fetch(`/api/fuel/portions/${existingId}`, {
              method: 'DELETE',
            });
          }
        }

        // Add new portions with calculated nutrients
        for (const portionedFood of portionedFoods) {
          if (portionedFood.foodId) {
            const nutrients = nutrientMap.get(portionedFood.foodId);
            await fetch(`/api/fuel/meals/${savedMealId}/portions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                foodId: portionedFood.foodId,
                portion: portionedFood.portion,
                calories: nutrients?.calories,
                macros: nutrients?.macros,
              }),
            });
          }
        }
      }

      router.push('/fuel/build/meals');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingMeal) {
    return (
      <div className="flex justify-center py-12">
        <div className="border-brand-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  return (
    <CreateEditForm
      isEditing={isEditing}
      loading={loading}
      entityName="Meal"
      handleSubmit={handleSubmit}
      onDelete={handleDelete}
    >
      <FormCard>
        <FormTitle>{isEditing ? 'Edit Meal' : 'New Meal'}</FormTitle>

        {error && (
          <div className="bg-red-500/10 p-3 border border-red-500/20 rounded-md text-red-500 text-sm">
            {error}
          </div>
        )}

        <MealFormFields
          formData={formData}
          setFormData={setFormData}
          portionedFoods={portionedFoods}
          setPortionedFoods={setPortionedFoods}
        />
      </FormCard>
    </CreateEditForm>
  );
}

