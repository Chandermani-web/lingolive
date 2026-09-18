import { useContext } from "react";
import { Mail, MapPin, Globe, Phone, Calendar, Link2, Heart, Users } from "lucide-react";
import AppContext from "../../Context/UseContext";
import "remixicon/fonts/remixicon.css";

const RightSideBar = () => {
  const { user } = useContext(AppContext);

  const contacts = [
    { icon: Mail, label: "Email", value: user?.email, color: "#22D3EE" },
    { icon: Phone, label: "Phone", value: user?.phone, color: "#10B981" },
    { icon: MapPin, label: "Location", value: user?.location, color: "#EC4899" },
    { icon: Globe, label: "Website", value: user?.website, color: "#8B5CF6", link: true },
    {
      icon: Calendar, label: "Born",
      value: user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : null,
      color: "#F59E0B",
    },
  ];

  const socials = [
    { key: "twitter", icon: "ri-twitter-x-fill", label: "Twitter", color: "#22D3EE" },
    { key: "instagram", icon: "ri-instagram-fill", label: "Instagram", color: "#EC4899" },
    { key: "linkedin", icon: "ri-linkedin-fill", label: "LinkedIn", color: "#3B82F6" },
    { key: "github", icon: "ri-github-fill", label: "GitHub", color: "#8B5CF6" },
  ];

  const hasSocial = user?.socialLinks && Object.values(user.socialLinks).some((l) => l);

  return (
    <div className="space-y-4 sticky top-20 animate-slideInRight">
      {/* Contact Info */}
      <div className="card-static p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-[#22D3EE]" />
          <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Contact Info
          </h3>
        </div>
        <div className="space-y-2">
          {contacts.map(
            (c, i) =>
              c.value && (
                <div
                  key={i}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors"
                >
                  <c.icon
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    style={{ color: c.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wide text-muted mb-0.5">
                      {c.label}
                    </p>
                    {c.link ? (
                      <a
                        href={c.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-secondary hover:text-white transition-colors truncate block"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <p className="text-xs text-secondary truncate">{c.value}</p>
                    )}
                  </div>
                </div>
              )
          )}
        </div>
      </div>

      {/* Interests */}
      {user?.interests && user.interests.length > 0 && (
        <div className="card-static p-5">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-[#EC4899]" />
            <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider">
              Interests
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {user.interests.map((interest, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-md text-xs font-medium text-secondary bg-[#0F141C] border border-[#18202B]"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Social Links */}
      {hasSocial && (
        <div className="card-static p-5">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-4 h-4 text-[#8B5CF6]" />
            <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider">
              Social
            </h3>
          </div>
          <div className="space-y-1.5">
            {socials.map(
              (s) =>
                user.socialLinks[s.key] && (
                  <a
                    key={s.key}
                    href={user.socialLinks[s.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${s.color}15` }}
                    >
                      <i className={`${s.icon} text-base`} style={{ color: s.color }}></i>
                    </div>
                    <span className="text-xs text-secondary group-hover:text-white transition-colors">
                      {s.label}
                    </span>
                  </a>
                )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSideBar;