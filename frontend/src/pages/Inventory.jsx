import React, { useState, useEffect } from 'react';
import api from '../api/client';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ item_name: '', quantity: 100, unit: 'pcs' });

  useEffect(() => {
    fetchInventory();
  }, [search]);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/inventory/', { params: { search } });
      setItems(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQty = async (item, delta) => {
    const newQty = Math.max(0, item.quantity + delta);
    try {
      await api.patch(`/inventory/${item.item_id}/`, { quantity: newQty });
      fetchInventory();
    } catch (err) {
      alert('Error updating stock: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/', formData);
      setShowModal(false);
      setFormData({ item_name: '', quantity: 100, unit: 'pcs' });
      fetchInventory();
    } catch (err) {
      alert('Error adding inventory: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete item #${id}?`)) return;
    try {
      await api.delete(`/inventory/${id}/`);
      fetchInventory();
    } catch (err) {
      alert('Error deleting item: ' + err.message);
    }
  };

  const lowStockCount = items.filter(i => i.quantity < 50).length;

  return (
    <div className="koshika-animate-fadein">
      {/* Modern Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-warning-subtle text-warning-emphasis koshika-page-title-badge">
              <i className="bi bi-box-seam-fill me-1"></i> Biobank Logistics
            </span>
            <span className="badge bg-light text-muted border rounded-pill small">
              {items.length} Tracked Consumables
            </span>
          </div>
          <h3 className="fw-bold mb-1 text-dark">Laboratory Inventory &amp; Consumables</h3>
          <p className="text-secondary mb-0 small">
            Live cryogenic vials, LN2 canisters, sterile pipette tips, cell culture reagents, and safety gear
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-warning text-dark fw-semibold d-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-xs"
        >
          <i className="bi bi-plus-circle-fill"></i>
          <span>Add Supply Item</span>
        </button>
      </div>

      {/* Stock Telemetry Widgets */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4">
          <div className="p-3 bg-white rounded-3 border shadow-2xs">
            <div className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-1 mb-1">
              <i className="bi bi-boxes text-primary"></i> Total Catalog
            </div>
            <div className="fs-4 fw-extrabold text-dark font-monospace">{items.length} Items</div>
            <small className="text-muted">Unique clinical SKUs</small>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="p-3 bg-white rounded-3 border shadow-2xs">
            <div className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-1 mb-1">
              <i className="bi bi-check2-circle text-success"></i> Stock Status
            </div>
            <div className="fs-4 fw-extrabold text-success font-monospace">{items.length - lowStockCount} Optimal</div>
            <small className="text-success">Available for procedures</small>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="p-3 bg-white rounded-3 border shadow-2xs">
            <div className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-1 mb-1">
              <i className="bi bi-exclamation-triangle text-warning"></i> Restock Notice
            </div>
            <div className="fs-4 fw-extrabold text-warning font-monospace">{lowStockCount} Items</div>
            <small className="text-muted">Under 50 units reserve</small>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="card border-0 shadow-sm p-3 mb-4 rounded-4">
        <div className="input-group koshika-search-box border rounded-3 p-0">
          <span className="input-group-text bg-transparent border-0 text-muted ps-3">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control border-0 shadow-none ps-2"
            placeholder="Search laboratory supplies by name (e.g. Cryo vials, Filter tips, Gloves)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="btn btn-link text-muted pe-3 text-decoration-none"
              onClick={() => setSearch('')}
            >
              <i className="bi bi-x-circle-fill"></i>
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table Card */}
      <div className="koshika-table-card">
        <div className="table-responsive">
          <table className="table koshika-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>SKU</th>
                <th>Supply Name</th>
                <th>In Stock Qty</th>
                <th>Unit Type</th>
                <th>Inventory Status</th>
                <th>Last Stock Audit</th>
                <th className="text-center">Quick Adjust</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-warning me-2"></div>
                    <span className="text-muted">Loading laboratory supplies inventory...</span>
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map(item => {
                  const isLow = item.quantity < 50;
                  return (
                    <tr key={item.item_id}>
                      <td><span className="font-monospace text-muted">#{item.item_id}</span></td>
                      <td>
                        <div className="fw-bold text-dark">{item.item_name}</div>
                      </td>
                      <td>
                        <span className="fs-6 fw-extrabold font-monospace text-dark">{item.quantity}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-muted border">{item.unit}</span>
                      </td>
                      <td>
                        {isLow ? (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                            <i className="bi bi-exclamation-circle me-1"></i> Restock Needed
                          </span>
                        ) : (
                          <span className="badge bg-success-subtle text-success border border-success-subtle">
                            ✓ Adequate Stock
                          </span>
                        )}
                      </td>
                      <td><small className="text-muted font-monospace">{item.last_updated ? new Date(item.last_updated).toLocaleDateString() : '-'}</small></td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm rounded-pill shadow-2xs border">
                          <button onClick={() => handleUpdateQty(item, -10)} className="btn btn-light border-0 py-1 px-2 text-secondary">-10</button>
                          <button onClick={() => handleUpdateQty(item, -1)} className="btn btn-light border-0 py-1 px-2 text-secondary">-1</button>
                          <button onClick={() => handleUpdateQty(item, 1)} className="btn btn-light border-0 py-1 px-2 text-primary fw-bold">+1</button>
                          <button onClick={() => handleUpdateQty(item, 10)} className="btn btn-light border-0 py-1 px-2 text-primary fw-bold">+10</button>
                        </div>
                      </td>
                      <td className="text-end pe-3">
                        <button
                          onClick={() => handleDelete(item.item_id)}
                          className="btn btn-sm btn-light border text-danger rounded-3 px-2 py-1"
                          title="Delete Item"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="8" className="text-center text-muted py-5">No laboratory supplies found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow">
              <form onSubmit={handleSubmit}>
                <div className="modal-header bg-light">
                  <h5 className="modal-title">Add Laboratory Supply</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Supply Item Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Cryovials 2ml, DMSO 10%"
                      value={formData.item_name}
                      onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Initial Quantity</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        required
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Unit of Measure</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="pcs, litres, vials"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Item</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
