import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import SalonCard from "../components/SalonCard";

const SalonList = () => {
  const [salons, setSalons] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const { data } = await api.get(`/salons?lat=${latitude}&lng=${longitude}&radius=10`);
          setSalons(data);
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to load salons");
        }
      },
      () => toast.error("Enable geolocation to see nearby salons")
    );
  }, []);

  return (
    <main className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold">Nearby Salons</h1>
      <div className="grid md:grid-cols-3 gap-4 mt-5">
        {salons.map((salon) => (
          <SalonCard key={salon.id} salon={salon} />
        ))}
      </div>
    </main>
  );
};

export default SalonList;