"use client";

import { useEffect, useState } from "react";

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  gender: string;
  age: number;
  nationality: string;
  imageUrl: string;
}

const API_BASE = "/api/v1/students";

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "Male",
    age: "",
    nationality: "",
    imageUrl: "",
  });

  const fetchStudents = async () => {
    try {
      const res = await fetch(API_BASE);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age: Number(form.age),
        }),
      });

      if (res.ok) {
        setForm({
          firstName: "",
          lastName: "",
          gender: "Male",
          age: "",
          nationality: "",
          imageUrl: "",
        });
        fetchStudents();
      }
    } catch (err) {
      console.error("Failed to add student", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (res.ok) fetchStudents();
    } catch (err) {
      console.error("Failed to delete student", err);
    }
  };
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Production Student Management System</h1>
          <p className="text-slate-400 text-sm">Full-Stack Next.js + Spring Boot + PostgreSQL</p>
        </header>

        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-white">Enroll New Student</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
            />
            <input
              required
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
            />
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              required
              type="number"
              placeholder="Age"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
            />
            <input
              required
              placeholder="Nationality"
              value={form.nationality}
              onChange={(e) => setForm({ ...form, nationality: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
            />
            <input
              required
              placeholder="Image URL (https://...)"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
            />
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition"
              >
                {loading ? "Adding..." : "+ Add Student"}
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Registered Students</h2>
            <span className="text-xs bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-slate-400">
              Total: {students.length}
            </span>
          </div>

          {students.length === 0 ? (
            <p className="text-slate-400 text-center py-8 border border-dashed border-slate-700 rounded-lg">
              No students found.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((st) => (
                <div key={st.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={st.imageUrl}
                      alt={st.firstName}
                      className="w-12 h-12 rounded-full object-cover bg-slate-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";
                      }}
                    />
                    <div>
                      <h3 className="font-semibold text-white">{st.firstName} {st.lastName}</h3>
                      <p className="text-xs text-slate-400">{st.gender} • {st.age} yrs • {st.nationality}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-700 flex justify-end">
                    <button
                      onClick={() => handleDelete(st.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
