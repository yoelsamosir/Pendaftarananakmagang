"use client";

import { FormEvent, useEffect, useState } from "react";
import DatePickerField from "@/components/DatePickerField";
import ConfirmDialog from "@/components/ConfirmDialog";

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
  const [scheduleFormKey, setScheduleFormKey] = useState(0);
  const [confirmTarget, setConfirmTarget] = useState<
    { type: "room"; id: string; name: string } | { type: "schedule"; id: string } | null
  >(null);

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
    setScheduleFormKey((k) => k + 1);
    loadAll();
  }

  async function handleDeleteSchedule(id: string) {
    await fetch(`/api/admin/schedules/${id}`, { method: "DELETE" });
    loadAll();
  }

  async function handleConfirmedDelete() {
    if (!confirmTarget) return;
    if (confirmTarget.type === "room") {
      await handleDeleteRoom(confirmTarget.id);
    } else {
      await handleDeleteSchedule(confirmTarget.id);
    }
    setConfirmTarget(null);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-serif font-bold text-stone-900">Jadwal / Ruangan</h1>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-stone-900">Daftar Ruangan</h2>
          <form onSubmit={handleAddRoom} className="mt-3 flex gap-2">
            <input
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Nama ruangan baru"
              required
              className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
            />
            <button className="rounded-md bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900">
              Tambah
            </button>
          </form>
          <ul className="mt-4 divide-y divide-stone-100">
            {rooms.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <span>{r.name}</span>
                <button
                  onClick={() => setConfirmTarget({ type: "room", id: r.id, name: r.name })}
                  className="text-red-600 hover:underline"
                >
                  Hapus
                </button>
              </li>
            ))}
            {rooms.length === 0 && (
              <li className="py-3 text-sm text-stone-400">Belum ada ruangan.</li>
            )}
          </ul>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-stone-900">Tambah Jadwal Penempatan</h2>
          <form key={scheduleFormKey} onSubmit={handleAddSchedule} className="mt-3 space-y-3">
            <select
              name="userId"
              required
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
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
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
            >
              <option value="">Pilih ruangan</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <DatePickerField label="Tanggal" name="date" required />
            <button className="w-full rounded-md bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900">
              Tambah Jadwal
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-stone-900">Semua Jadwal</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-stone-50 text-left text-stone-500">
              <tr>
                <th className="px-3 py-2 font-medium">Tanggal</th>
                <th className="px-3 py-2 font-medium">Peserta</th>
                <th className="px-3 py-2 font-medium">Ruangan</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
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
                      onClick={() => setConfirmTarget({ type: "schedule", id: s.id })}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-stone-400">
                    Belum ada jadwal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={confirmTarget !== null}
        title={confirmTarget?.type === "room" ? "Hapus Ruangan" : "Hapus Jadwal"}
        message={
          confirmTarget?.type === "room"
            ? `Yakin ingin menghapus ruangan "${confirmTarget.name}"? Jadwal yang terkait mungkin akan terpengaruh.`
            : "Yakin ingin menghapus jadwal penempatan ini?"
        }
        onConfirm={handleConfirmedDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
