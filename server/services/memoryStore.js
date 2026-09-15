/**
 * In-Memory Resilient Store for TaxShield API
 * Provides fallback persistence for Users, Bills, and Complaints
 * when MongoDB Atlas is unreachable or operating offline.
 */
import bcrypt from 'bcryptjs';

class MemoryStore {
  constructor() {
    this.users = new Map();
    this.bills = new Map();
    this.complaints = new Map();
    this._seedDefaults();
  }

  _seedDefaults() {
    // Default system seed user
    const defaultUser = {
      _id: 'usr_default_admin',
      id: 'usr_default_admin',
      name: 'TaxShield Master Tester',
      email: 'admin@taxshield.ai',
      passwordHash: bcrypt.hashSync('Password123!', 10),
      createdAt: new Date(),
    };
    this.users.set(defaultUser.email, defaultUser);
    this.users.set(defaultUser._id, defaultUser);
  }

  // --- USER STORE ---
  async createUser({ name, email, password, role = 'user' }) {
    const normalizedEmail = email.toLowerCase().trim();
    if (this.users.has(normalizedEmail)) {
      return null; // duplicate
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const user = {
      _id: id,
      id,
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      createdAt: new Date(),
    };

    this.users.set(normalizedEmail, user);
    this.users.set(id, user);
    return user;
  }

  findUserByEmail(email) {
    if (!email) return null;
    return this.users.get(email.toLowerCase().trim()) || null;
  }

  findUserById(id) {
    if (!id) return null;
    return this.users.get(id) || null;
  }

  async verifyPassword(user, plainPassword) {
    if (!user || !user.passwordHash) return false;
    return bcrypt.compare(plainPassword, user.passwordHash);
  }

  // --- BILL STORE ---
  createBill(billData) {
    const id = billData._id || billData.id || 'bill_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const bill = {
      ...billData,
      _id: id,
      id,
      createdAt: billData.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.bills.set(id, bill);
    return bill;
  }

  findBillById(id) {
    if (!id) return null;
    return this.bills.get(id) || null;
  }

  findBills({ search = '', userId = null, billType = null, limit = 100 } = {}) {
    let list = Array.from(this.bills.values());

    if (userId && userId !== 'guest') {
      list = list.filter((b) => b.userId === userId);
    }

    if (billType && billType !== 'ALL') {
      list = list.filter((b) => (b.billType || '').toUpperCase() === billType.toUpperCase());
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((b) =>
        (b.restaurantName || '').toLowerCase().includes(q) ||
        (b.retailer || '').toLowerCase().includes(q) ||
        (b.category || '').toLowerCase().includes(q) ||
        (b.invoiceNo || '').toLowerCase().includes(q) ||
        (b.billNumber || '').toLowerCase().includes(q)
      );
    }

    return list.slice(0, limit);
  }

  updateBill(id, updateData) {
    const bill = this.bills.get(id);
    if (!bill) return null;
    const updated = { ...bill, ...updateData, updatedAt: new Date() };
    this.bills.set(id, updated);
    return updated;
  }

  deleteBill(id) {
    return this.bills.delete(id);
  }

  // --- COMPLAINTS STORE ---
  createComplaint(complaintData) {
    const id = complaintData._id || 'cmp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const complaint = {
      ...complaintData,
      _id: id,
      id,
      status: complaintData.status || 'Generated',
      createdAt: complaintData.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.complaints.set(id, complaint);
    return complaint;
  }

  findComplaintById(id) {
    if (!id) return null;
    return this.complaints.get(id) || null;
  }

  findComplaints({ userId = null } = {}) {
    let list = Array.from(this.complaints.values());
    if (userId && userId !== 'guest') {
      list = list.filter((c) => c.userId === userId);
    }
    return list;
  }

  updateComplaint(id, updateData) {
    const complaint = this.complaints.get(id);
    if (!complaint) return null;
    const updated = { ...complaint, ...updateData, updatedAt: new Date() };
    this.complaints.set(id, updated);
    return updated;
  }

  deleteComplaint(id) {
    return this.complaints.delete(id);
  }
}

export const memoryStore = new MemoryStore();
export default memoryStore;
