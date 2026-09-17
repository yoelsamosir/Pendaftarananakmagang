"use client";

import { FormEvent, useEffect, useState } from "react";

type Room = { id: string; name: string };
type Participant = { id: string; name: string; application: { namaLengkap: string } | null };
type Schedule = {
  id: string;
  date: string;
  room: Room;
  user: { id: string; name: string };
};

export default function AdminJadwalPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");

  async function loadAll() {
    const [roomsRes, participantsRes, schedulesRes] = await Promise.all([
      fetch("/api/admin/rooms").then((r) => r.json()),
      fetch("/api/admin/participants").then((r) => r.json()),
      fetch("/api/admin/schedules").then((r) => r.json()),
    ]);
    setRooms(roomsRes.rooms ?? []);
    setParticipants(participantsRes.participants ?? []);
    setSchedules(schedulesRes.schedules ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    loadAll();
  }, []);

  async function handleAddRoom(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRoomName }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error);
      return;
    }
    setNewRoomName("");
    loadAll();
  }

  async function handleDeleteRoom(id: string) {
    if (!confirm("Hapus ruangan ini?")) return;
    await fetch(`/api/admin/rooms/${id}`, { method: "DELETE" });
    loadAll();
  }

  async function handleAddSchedule(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await fetch("/api/admin/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: formData.get("roomId"),
        userId: formData.get("userId"),
        date: formData.get("date"),
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error);
      return;
    }
    form.reset();
    loadAll();
  }

  async function handleDeleteSchedule(id: string) {
    if (!confirm("Hapus jadwal ini?")) return;
    await fetch(`/api/admin/schedules/${id}`, { method: "DELETE" });
    loadAll();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Jadwal / Ruangan</h1>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Daftar Ruangan</h2>
          <form onSubmit={handleAddRoom} className="mt-3 flex gap-2">
            <input
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Nama ruangan baru"
              required
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
              Tambah
            </button>
          </form>
          <ul className="mt-4 divide-y divide-slate-100">
            {rooms.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <span>{r.name}</span>
                <button
                  onClick={() => handleDeleteRoom(r.id)}
                  className="text-red-600 hover:underline"
                >
                  Hapus
                </button>
              </li>
            ))}
            {rooms.length === 0 && (
              <li className="py-3 text-sm text-slate-400">Belum ada ruangan.</li>
            )}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Tambah Jadwal Penempatan</h2>
          <form onSubmit={handleAddSchedule} className="mt-3 space-y-3">
            <select
              name="userId"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Pilih peserta</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              name="roomId"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Pilih ruangan</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="date"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button className="w-full rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
              Tambah Jadwal
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Semua Jadwal</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Tanggal</th>
                <th className="px-3 py-2 font-medium">Peserta</th>
                <th className="px-3 py-2 font-medium">Ruangan</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.map((s) => (
                <tr key={s.id}>
                  <td className="px-3 py-2">
                    {new Date(s.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-3 py-2">{s.user.name}</td>
                  <td className="px-3 py-2">{s.room.name}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => handleDeleteSchedule(s.id)}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-slate-400">
                    Belum ada jadwal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
