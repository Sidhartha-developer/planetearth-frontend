import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { User, CheckCircle, Star } from "lucide-react";
import axios from "axios";

const Testimonials = () => {
  const { isWater } = useTheme();

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5); // ⭐ NEW
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    roleOrLocation: "",
    message: "",
  });

  const [imageFile, setImageFile] = useState(null);

  const API = import.meta.env.VITE_API_BASE_URL;

  /* ================= FETCH APPROVED TESTIMONIALS ================= */
  const fetchTestimonials = async () => {
    try {
      const res = await axios.get(`${API}/api/testimonials/approved`);
      setTestimonials(res.data.testimonials || []);
    } catch (err) {
      console.error("Failed to load testimonials", err);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  /* ================= FORM HANDLERS ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("roleOrLocation", form.roleOrLocation);
      data.append("message", form.message);
      data.append("rating", rating); // ⭐ SEND RATING
      if (imageFile) data.append("image", imageFile);

      await axios.post(`${API}/api/testimonials/public`, data);

      setSuccess(true);
      setForm({ name: "", roleOrLocation: "", message: "" });
      setRating(5); // ⭐ reset
      setImageFile(null);
    } catch (err) {
      console.error("Submit failed", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= THEME CLASSES ================= */
  const accent = isWater ? "text-blue-500" : "text-orange-500";
  const bgAccent = isWater
    ? "bg-blue-500/10 border-blue-500/30"
    : "bg-orange-500/10 border-orange-500/30";

  return (
    <section
      id="testimonials"
      className="py-24 bg-card relative overflow-hidden"
    >
      {/* Glow Background */}
      <div className="absolute inset-0 bg-glow opacity-20 transition-theme" />

      <div className="container mx-auto px-6 relative z-10">
        {/* ================= HEADER ================= */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className={`inline-block font-medium mb-4 ${accent}`}>
            Testimonials
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Trusted by <span className="gradient-text">Real People</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Real experiences from customers who trusted our{" "}
            {isWater ? "water" : "solar"} solutions.
          </p>
        </div>

        {/* ================= FORM ================= */}
        <div
          className={`max-w-2xl mx-auto mb-20 rounded-3xl p-8 border backdrop-blur-xl transition-theme ${bgAccent}`}
        >
          <h3 className="font-display text-xl font-semibold mb-6 text-foreground">
            Share Your Experience
          </h3>

          {success && (
            <div className="flex items-center gap-2 mb-4 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>Your testimonial was submitted for approval</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full px-4 py-3 rounded-xl border bg-background"
            />

            <input
              name="roleOrLocation"
              value={form.roleOrLocation}
              onChange={handleChange}
              placeholder="Location / Role (optional)"
              className="w-full px-4 py-3 rounded-xl border bg-background"
            />

            {/* ⭐ STAR RATING */}
            <div>
              <p className="text-sm mb-2 text-muted-foreground">
                Your Rating
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-6 h-6 cursor-pointer transition ${
                      star <= rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            </div>

            <textarea
              name="message"
              required
              rows={4}
              value={form.message}
              onChange={handleChange}
              placeholder="Share your experience..."
              className="w-full px-4 py-3 rounded-xl border bg-background"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm"
            />

            <button
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all bg-gradient-to-r from-primary to-primary/80 hover:opacity-90"
            >
              {loading ? "Submitting..." : "Submit Testimonial"}
            </button>
          </form>
        </div>

        {/* ================= APPROVED TESTIMONIALS ================= */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t._id}
              className="relative rounded-3xl p-6 border card-gradient transition-all hover:-translate-y-2"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center gap-4 mb-3">
                {t.image ? (
                  <img
                    src={`${API}${t.image}`}
                    alt={t.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                )}

                <div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  {t.roleOrLocation && (
                    <p className="text-sm text-muted-foreground">
                      {t.roleOrLocation}
                    </p>
                  )}
                </div>
              </div>

              {/* ⭐ DISPLAY STARS */}
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= (t.rating || 5)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed">
                “{t.message}”
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
