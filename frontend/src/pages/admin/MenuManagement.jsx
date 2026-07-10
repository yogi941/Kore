import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Loader from '../../components/common/Loader';
import useAuth from '../../hooks/useAuth';
import { fetchMenuByCanteen, createMenuItem, updateMenuItem, deleteMenuItem, toggleItemAvailability } from '../../api/menuApi';
import toast from 'react-hot-toast';

const CATEGORIES = ['breakfast', 'lunch', 'snacks', 'beverages'];
const EMPTY_FORM = { name: '', description: '', price: '', category: 'lunch', isVeg: true, preparationTime: 10, image: '' };

const MenuManagement = () => {
  const { user } = useAuth();
  const canteenId = user?.canteen?._id || user?.canteen;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = { isAvailable: undefined };
      if (categoryFilter) params.category = categoryFilter;
      const { data } = await fetchMenuByCanteen(canteenId, params);
      setItems(data.data || []);
    } catch {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canteenId) loadItems();
  }, [canteenId, categoryFilter]);

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name, description: item.description || '',
      price: item.price, category: item.category,
      isVeg: item.isVeg, preparationTime: item.preparationTime, image: item.image || '',
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    setSaving(true);
    try {
      if (editItem) {
        const { data } = await updateMenuItem(editItem._id, form);
        setItems((prev) => prev.map((i) => (i._id === editItem._id ? data.data : i)));
        toast.success('Item updated');
      } else {
        const { data } = await createMenuItem({ ...form, canteen: canteenId });
        setItems((prev) => [data.data, ...prev]);
        toast.success('Item created');
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await deleteMenuItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success('Item deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await toggleItemAvailability(id);
      setItems((prev) => prev.map((i) => (i._id === id ? { ...i, isAvailable: data.data.isAvailable } : i)));
    } catch {
      toast.error('Toggle failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
          {['', ...CATEGORIES].map((cat) => (
            <button key={cat || 'all'} onClick={() => setCategoryFilter(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                categoryFilter === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
              }`}>
              {cat || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item._id} className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                item.isAvailable ? 'border-gray-100' : 'border-gray-200 opacity-60'
              }`}>
                <div className="h-32 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-4xl">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : '🍛'}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                    <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-0.5 ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                  <p className="text-xs text-gray-400 capitalize mb-2">{item.category}</p>
                  <p className="font-bold text-gray-900">₹{item.price}</p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <button onClick={() => handleToggle(item._id)}
                      className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                        item.isAvailable ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'
                      }`}>
                      {item.isAvailable
                        ? <><ToggleRight className="w-4 h-4" /> Available</>
                        : <><ToggleLeft className="w-4 h-4" /> Unavailable</>}
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">🍽️</p>
                <p>No menu items found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">{editItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Masala Dosa"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                  <input type="number" value={form.preparationTime} onChange={(e) => setForm({ ...form, preparationTime: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 capitalize">
                  {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <div className="flex items-center gap-3">
                <button type="button"
                  onClick={() => setForm({ ...form, isVeg: !form.isVeg })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    form.isVeg ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-600 border-red-300'
                  }`}>
                  <div className={`w-3 h-3 rounded-full ${form.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                  {form.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
                  {saving ? 'Saving...' : editItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
