'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { CreateEditForm } from '@/components/ui/CreateEditForm';
import { FormCard, FormTitle, FormGroup, FormLabel, FormInput, FormTextarea, FormSelect } from '@/components/ui/Form';
import { FoodAutocomplete } from '@/components/fuel/build/foods/FoodAutocomplete';
import { SERVING_SIZE_UNITS } from '@/components/fuel/build/foods/options';
import type { MealInstance, PortionedFoodInstance, Food } from '@/types/fuel';
import type { ServingSizeMeasurement } from '@/types/measures';

interface MealInstanceFormProps {
  initialData: MealInstance;
}

interface PortionedFoodFormData {
  id?: string; // Database ID if it exists
  clientId: string; // Temporary ID for new items
  foodId: string;
  foodName?: string;
  portion: ServingSizeMeasurement;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Failed to fetch');
  }
  return res.json();
}

export default function MealInstanceForm({ initialData }: MealInstanceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingFoods, setLoadingFoods] = useState(true);
  
  const [date, setDate] = useState<string>(() => {
    const d = new Date(initialData.date);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState<string>(() => {
    if (initialData.timestamp) {
      const t = new Date(initialData.timestamp);
      return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    }
    return '';
  });
  const [complete, setComplete] = useState(initialData.complete);
  const [notes, setNotes] = useState(initialData.notes || '');
  const [portionedFoods, setPortionedFoods] = useState<PortionedFoodFormData[]>([]);

  // Load existing portioned food instances
  useEffect(() => {
    let cancelled = false;

    async function loadFoods() {
      try {
        setLoadingFoods(true);
        const res = await fetchJson<{ portionedFoodInstances: PortionedFoodInstance[] }>(
          `/api/fuel/meals/instances/${initialData.id}/portioned-foods`
        );

        if (cancelled) return;

        // Fetch food names for each instance
        const foodsData = await Promise.all(
          res.portionedFoodInstances.map(async (pf, index) => {
            let foodName = '';
            if (pf.foodId) {
              try {
                const foodRes = await fetch(`/api/fuel/foods/${pf.foodId}`);
                if (foodRes.ok) {
                  const food: Food = await foodRes.json();
                  foodName = food.name || '';
                }
              } catch (err) {
                console.error('Failed to fetch food name', err);
              }
            }
            return {
              id: pf.id,
              clientId: `portion-${pf.id}-${index}`,
              foodId: pf.foodId,
              foodName,
              portion: pf.portion,
            };
          })
        );

        if (!cancelled) {
          setPortionedFoods(foodsData);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to load portioned foods', err);
        }
      } finally {
        if (!cancelled) {
          setLoadingFoods(false);
        }
      }
    }

    loadFoods();
    return () => {
      cancelled = true;
    };
  }, [initialData.id]);

  const addFood = () => {
    const newPortion: PortionedFoodFormData = {
      clientId: `portion-new-${Date.now()}`,
      foodId: '',
      foodName: '',
      portion: {
        value: 1,
        unit: 'count',
      },
    };
    setPortionedFoods([...portionedFoods, newPortion]);
  };

  const removeFood = (clientId: string) => {
    setPortionedFoods(portionedFoods.filter(pf => pf.clientId !== clientId));
  };

  const updateFood = (clientId: string, food: Food | null) => {
    setPortionedFoods(portionedFoods.map(pf => {
      if (pf.clientId === clientId) {
        const shouldResetPortion = !pf.foodId && food?.servingSize;
        return {
          ...pf,
          foodId: food?.id || '',
          foodName: food?.name || '',
          portion: shouldResetPortion ? food.servingSize : pf.portion,
        };
      }
      return pf;
    }));
  };

  const updatePortion = (clientId: string, field: 'value' | 'unit', value: string | number) => {
    setPortionedFoods(portionedFoods.map(pf => {
      if (pf.clientId === clientId) {
        return {
          ...pf,
          portion: {
            ...pf.portion,
            [field]: field === 'value' 
              ? (typeof value === 'string' ? parseFloat(value) || 0 : value)
              : value,
          },
        };
      }
      return pf;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Parse date and timestamp in local timezone
      // Parse date string (YYYY-MM-DD) and create Date in local timezone at midnight
      const [year, month, day] = date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day, 0, 0, 0, 0);
      
      // Create timestamp if time is provided (date + time in local timezone)
      let timestamp: Date | null = null;
      if (time) {
        const [hours, minutes] = time.split(':').map(Number);
        timestamp = new Date(year, month - 1, day, hours, minutes, 0, 0);
      }

      // Convert dates to ISO strings to avoid timezone issues when JSON.stringify converts Date objects
      // This matches the approach used in VoiceJournalConfirmation and RecordTab
      const updateData = {
        date: dateObj.toISOString(),
        timestamp: timestamp?.toISOString() || null,
        complete,
        notes: notes || undefined,
      };

      // Update meal instance
      const res = await fetch(`/api/fuel/meals/instances/${initialData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update meal instance');
      }

      // Get current portioned food instances to determine what to add/update/delete
      const currentRes = await fetchJson<{ portionedFoodInstances: PortionedFoodInstance[] }>(
        `/api/fuel/meals/instances/${initialData.id}/portioned-foods`
      );
      const currentInstances = currentRes.portionedFoodInstances;
      const currentIds = new Set(currentInstances.map(pf => pf.id));
      
      // Determine which items are new, updated, or deleted
      const newItems = portionedFoods.filter(pf => !pf.id);
      const updatedItems = portionedFoods.filter(pf => pf.id && currentIds.has(pf.id));
      const deletedIds = Array.from(currentIds).filter(id => 
        !portionedFoods.some(pf => pf.id === id)
      );

      // Create new items
      for (const item of newItems) {
        if (item.foodId) {
          await fetch(`/api/fuel/meals/instances/${initialData.id}/portioned-foods`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              foodId: item.foodId,
              portion: item.portion,
            }),
          });
        }
      }

      // Update existing items
      for (const item of updatedItems) {
        if (item.id && item.foodId) {
          await fetch(`/api/fuel/meals/instances/${initialData.id}/portioned-foods/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              foodId: item.foodId,
              portion: item.portion,
            }),
          });
        }
      }

      // Delete removed items
      for (const id of deletedIds) {
        await fetch(`/api/fuel/meals/instances/${initialData.id}/portioned-foods/${id}`, {
          method: 'DELETE',
        });
      }

      router.push('/fuel');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update meal instance');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/fuel/meals/instances/${initialData.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete meal instance');
      }

      router.push('/fuel');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete meal instance');
      throw err;
    }
  };

  return (
    <CreateEditForm
      isEditing={true}
      loading={loading}
      entityName="Meal Instance"
      handleSubmit={handleSubmit}
      onDelete={handleDelete}
    >
      <FormCard>
        <FormTitle>Edit Meal Instance</FormTitle>
        
        {error && (
          <div className="bg-red-500/10 p-3 border border-red-500/20 rounded-md text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          <FormGroup className="max-w-[92%]">
            <FormLabel>Date</FormLabel>
            <FormInput
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup className="max-w-[92%]">
            <FormLabel>Time (optional)</FormLabel>
            <FormInput
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </FormGroup>
        </div>

        <FormGroup>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={complete}
              onChange={(e) => setComplete(e.target.checked)}
              className="text-brand-primary"
            />
            <span className="text-sm">Mark as complete</span>
          </label>
        </FormGroup>

        <FormGroup>
          <FormLabel>Notes (optional)</FormLabel>
          <FormTextarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this meal..."
          />
        </FormGroup>
      </FormCard>

      {/* Foods Section */}
      <FormCard>
        <div className="flex justify-between items-center mb-4">
          <FormTitle>Foods</FormTitle>
          <button
            type="button"
            onClick={addFood}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-md text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Food
          </button>
        </div>

        {loadingFoods ? (
          <div className="text-muted-foreground text-sm text-center py-4">Loading foods...</div>
        ) : portionedFoods.length === 0 ? (
          <div className="bg-background/50 p-4 border border-border rounded-md text-muted-foreground text-sm text-center">
            No foods added yet. Click "Add Food" to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {portionedFoods.map((portionedFood) => (
              <div
                key={portionedFood.clientId}
                className="bg-background/50 p-4 border border-border rounded-md"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-foreground text-sm">
                    {portionedFood.foodName || 'Select a food'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeFood(portionedFood.clientId)}
                    className="text-red-500 hover:text-red-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <FormGroup>
                    <FormLabel className="text-xs">Food</FormLabel>
                    <FoodAutocomplete
                      initialFoodId={portionedFood.foodId}
                      onChange={(food) => updateFood(portionedFood.clientId, food)}
                    />
                  </FormGroup>

                  {portionedFood.foodId && (
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                      <FormGroup>
                        <FormLabel className="text-xs">Portion Value</FormLabel>
                        <FormInput
                          type="number"
                          step=".1"
                          min="0"
                          value={portionedFood.portion.value || ''}
                          onChange={(e) => updatePortion(portionedFood.clientId, 'value', e.target.value)}
                        />
                      </FormGroup>

                      <FormGroup>
                        <FormLabel className="text-xs">Portion Unit</FormLabel>
                        <FormSelect
                          value={portionedFood.portion.unit}
                          onChange={(e) => updatePortion(portionedFood.clientId, 'unit', e.target.value)}
                        >
                          {SERVING_SIZE_UNITS.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </FormSelect>
                      </FormGroup>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </FormCard>
    </CreateEditForm>
  );
}

