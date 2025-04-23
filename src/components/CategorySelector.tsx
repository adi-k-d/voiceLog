
import React from 'react';
import { Button } from '@/components/ui/button';

export type NoteCategory = 'Work Update' | 'Improvement Idea' | 'New Learning';

interface CategorySelectorProps {
  selectedCategory: NoteCategory | null;
  onSelectCategory: (category: NoteCategory) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ selectedCategory, onSelectCategory }) => {
  const categories: NoteCategory[] = ['Work Update', 'Improvement Idea', 'New Learning'];
  
  return (
    <div className="w-full max-w-md mx-auto px-4">
      <h2 className="text-lg font-medium text-center mb-6">Select a Category</h2>
      <div className="flex flex-col gap-3 items-center">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => onSelectCategory(category)}
            className="w-full max-w-[250px]"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;