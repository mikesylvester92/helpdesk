'use client';

import { useState, useEffect } from 'react';
import { TableSkeleton } from '@/components/ui/loading-spinner';
import { Plus, CreditCard as Edit, Trash2, Tag } from 'lucide-react';

interface Subcategory {
  id: string;
  name: string;
  parent_category_id: string;
}

interface Category {
  id: string;
  name: string;
}

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [subcategoryName, setSubcategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subcategoriesRes, categoriesRes] = await Promise.all([
        fetch('/api/subcategories'),
        fetch('/api/categories')
      ]);
      
      const [subcategoriesData, categoriesData] = await Promise.all([
        subcategoriesRes.json(),
        categoriesRes.json()
      ]);
      
      setSubcategories(subcategoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSubcategory) {
        // Update existing subcategory
        const response = await fetch(`/api/subcategories/${editingSubcategory.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            name: subcategoryName,
            parent_category_id: selectedCategoryId 
          }),
        });

        if (response.ok) {
          const updatedSubcategory = await response.json();
          setSubcategories(subcategories.map(sub => 
            sub.id === editingSubcategory.id ? updatedSubcategory : sub
          ));
        }
      } else {
        // Create new subcategory
        const response = await fetch('/api/subcategories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            name: subcategoryName,
            parent_category_id: selectedCategoryId 
          }),
        });

        if (response.ok) {
          const newSubcategory = await response.json();
          setSubcategories([...subcategories, newSubcategory]);
        }
      }

      setShowModal(false);
      setEditingSubcategory(null);
      setSubcategoryName('');
      setSelectedCategoryId('');
    } catch (error) {
      console.error('Error saving subcategory:', error);
    }
  };

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoryName(subcategory.name);
    setSelectedCategoryId(subcategory.parent_category_id);
    setShowModal(true);
  };

  const handleDelete = async (subcategoryId: string) => {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      try {
        const response = await fetch(`/api/subcategories/${subcategoryId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setSubcategories(subcategories.filter(sub => sub.id !== subcategoryId));
        }
      } catch (error) {
        console.error('Error deleting subcategory:', error);
      }
    }
  };

  const openCreateModal = () => {
    setEditingSubcategory(null);
    setSubcategoryName('');
    setSelectedCategoryId(categories[0]?.id || '');
    setShowModal(true);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sub-Category Management</h1>
            <p className="text-gray-600 mt-1">Manage ticket sub-categories and their parent categories</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sub-Category</span>
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">All Sub-Categories</h2>
            <span className="text-sm text-gray-500">{subcategories.length} sub-categories</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6">
              <TableSkeleton />
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sub-Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subcategories.map((subcategory) => (
                  <tr key={subcategory.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Tag className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {subcategory.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getCategoryName(subcategory.parent_category_id)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(subcategory)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(subcategory.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSubcategory ? 'Edit Sub-Category' : 'Create New Sub-Category'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label htmlFor="subcategoryName" className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-Category Name
                </label>
                <input
                  type="text"
                  id="subcategoryName"
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter sub-category name"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Category
                </label>
                <select
                  id="parentCategory"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingSubcategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}