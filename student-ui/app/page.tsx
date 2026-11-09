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
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchStudents();
      }
    } catch (err) {
      console.error("Failed to delete student", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold tracking-wide uppercase border border-indigo-500/20">
            Student Directory System
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
            Student Management
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            CRUD operations powered by Next.js, Spring Boot, and PostgreSQL.
          </p>
        </div>

        {/* Input Form Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            Enroll New Student
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">First Name</label>
                <input
                  required
                  placeholder="e.g. Sok"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Last Name</label>
                <input
                  required
                  placeholder="e.g. San"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Age</label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 21"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Nationality</label>
                <input
                  required
                  placeholder="e.g. Cambodian"
                  value={form.nationality}
                  onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Photo URL</label>
                <input
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition duration-200 transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Adding..." : "+ Add Student"}
              </button>
            </div>
          </form>
        </div>

        {/* Student Cards Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Registered Students
            </h2>
            <span className="text-xs bg-slate-800 text-slate-400 py-1 px-3 rounded-full border border-slate-700">
              Total: {students.length}
            </span>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-700 rounded-2xl bg-slate-800/20">
              <p className="text-slate-400 text-sm">No students registered yet. Add one above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="group relative bg-slate-800/7
