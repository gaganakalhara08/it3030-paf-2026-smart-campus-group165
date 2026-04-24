import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import "../App.css";

const campusImages = [
  {
    title: "Learning commons",
    location: "Open spaces for study and collaboration",
    image:
      "https://images.unsplash.com/photo-1741707596433-06c5531473ec?auto=format&fit=crop&w=1600&q=90",
    fallback:
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1600&q=90"
  },
  {
    title: "Smart facilities",
    location: "Book labs, halls, and shared rooms",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=90",
    fallback:
      "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=1600&q=90"
  },
  {
    title: "Campus support",
    location: "Track maintenance tickets in one place",
    image:
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1600&q=90",
    fallback:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=90"
  }
];

const LandingPage = () => {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="hero-kicker">
            <Sparkles size={16} />
            Campus life, connected
          </span>
          <h1>Smart Campus</h1>
          <p>
            A smoother way for students, staff, and admins to manage campus
            resources, bookings, and support requests from one beautiful portal.
          </p>

          <div className="hero-buttons">
            <Link to="/login" className="hero-primary">
              Login to Portal <ArrowRight size={18} />
            </Link>
            <Link to="/signup" className="hero-secondary">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <section className="slides-section" aria-label="Campus image showcase">
        <div className="slides-heading">
          <span>Explore the campus</span>
          <h2>Spaces that keep student life moving.</h2>
        </div>
        <div className="hero-showcase" aria-label="Campus image showcase">
          <div className="showcase-track">
            {[...campusImages, ...campusImages].map((item, index) => (
              <article className="campus-slide" key={`${item.title}-${index}`}>
                <img
                  src={item.image}
                  alt={item.title}
                  onError={(event) => {
                    if (event.currentTarget.src !== item.fallback) {
                      event.currentTarget.src = item.fallback;
                    }
                  }}
                />
                <div className="slide-caption">
                  <strong>{item.title}</strong>
                  <span>{item.location}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
