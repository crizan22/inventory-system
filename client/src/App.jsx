import { useState, useEffect } from "react";
import "./App.css";

const emptyForm = { name: "", quantity: "", price: "" };

export default function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  async function loadItems() {
    const res = await fetch("/api/items");
    setItems(await res.json());
  }

  useEffect(() => {
    loadItems();
  }, []);
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const url = editingId ? `/api/items/${editingId}` : "/api/items";
    await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm(emptyForm);
    setEditingId(null);
    loadItems();
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({ name: item.name, quantity: item.quantity, price: item.price });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    loadItems();
  }
  const totalValue = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  return (
    <div className="container">
      <h1>Inventory System</h1>

      <form onSubmit={handleSubmit} className="form">
        <input name="name" placeholder="Item name" value={form.name} onChange={handleChange} />
        <input name="quantity" type="number" min="0" placeholder="Quantity" value={form.quantity} onChange={handleChange} />
        <input name="price" type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={handleChange} />
        <button type="submit">{editingId ? "Update" : "Add"}</button>
        {editingId && <button type="button" onClick={cancelEdit}>Cancel</button>}
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr><td colSpan="4">No items yet.</td></tr>
          )}
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td className={item.quantity <= 5 ? "low" : ""}>{item.quantity}</td>
              <td>{item.price.toFixed(2)}</td>
              <td>
                <button onClick={() => startEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="total">Total stock value: {totalValue.toFixed(2)}</p>
    </div>
  );
}