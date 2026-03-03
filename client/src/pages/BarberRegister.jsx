import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { ImagePlus, UploadCloud } from "lucide-react";
import uploadImageToImageKit from "../utils/imageUpload";

const BarberRegister = () => {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);
  const { registerBarberWithToken } = useAuth();
  const navigate = useNavigate();
  const [requireInvite, setRequireInvite] = useState(false);
  const [loadingPolicy, setLoadingPolicy] = useState(true);
  const [shopImageUrl, setShopImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    salonName: "",
    address: "",
    lat: "",
    lng: "",
    avgServiceTime: "20",
  });

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const { data } = await api.get("/auth/barber-registration-policy");
        setRequireInvite(Boolean(data.requireBarberInvite));
      } catch (_) {
        setRequireInvite(false);
      } finally {
        setLoadingPolicy(false);
      }
    };
    fetchPolicy();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (requireInvite && !token) return toast.error("Invite token missing");
    try {
      await registerBarberWithToken(token, { ...form, imageUrl: shopImageUrl || null });
      navigate("/barber/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Barber registration failed");
    }
  };

  const onShopImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const uploaded = await uploadImageToImageKit(file, "/nextcut/shops");
      setShopImageUrl(uploaded.url);
      toast.success("Shop image uploaded");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold">Barber Registration</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
        {loadingPolicy
          ? "Checking registration policy..."
          : `Invite required: ${requireInvite ? "Yes" : "No"} | Token: ${token ? "present" : "missing"}`}
      </p>
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4 mt-4">
        <form onSubmit={onSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 grid md:grid-cols-2 gap-3">
          <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" name="name" placeholder="Name" value={form.name} onChange={onChange} required />
          <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" name="phone" placeholder="Phone" value={form.phone} onChange={onChange} required />
          <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
          <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
          <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" name="salonName" placeholder="Salon Name" value={form.salonName} onChange={onChange} required />
          <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" name="avgServiceTime" type="number" min="5" placeholder="Avg Service Time" value={form.avgServiceTime} onChange={onChange} required />
          <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2 md:col-span-2" name="address" placeholder="Address" value={form.address} onChange={onChange} required />
          <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" name="lat" placeholder="Latitude" value={form.lat} onChange={onChange} required />
          <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" name="lng" placeholder="Longitude" value={form.lng} onChange={onChange} required />
          <label className="md:col-span-2 border border-dashed border-slate-400 dark:border-slate-600 rounded px-3 py-3 flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2 text-sm">
              <ImagePlus size={16} />
              {uploadingImage ? "Uploading shop image..." : "Upload shop photo"}
            </span>
            <UploadCloud size={16} />
            <input type="file" accept="image/*" className="hidden" onChange={onShopImageChange} />
          </label>
          {shopImageUrl && (
            <img
              src={shopImageUrl}
              alt="Shop preview"
              className="md:col-span-2 w-full h-44 object-cover rounded-lg border border-slate-300 dark:border-slate-700"
            />
          )}
          <button className="md:col-span-2 bg-brand text-white rounded px-3 py-2 disabled:opacity-60" disabled={uploadingImage}>
            Create Barber Account
          </button>
        </form>
        <img
          src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1200&q=80"
          alt="Barber shop"
          className="rounded-xl border border-slate-200 dark:border-slate-700 h-full min-h-[420px] object-cover"
        />
      </div>
    </main>
  );
};

export default BarberRegister;
