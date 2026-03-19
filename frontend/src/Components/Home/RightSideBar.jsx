import { useContext } from "react";
import AppContext from "../../Context/UseContext";
import { Mail, MapPin, Globe, Phone, Calendar, Users, Heart } from "lucide-react";
import "remixicon/fonts/remixicon.css";

const RightSideBar = () => {
  const { user } = useContext(AppContext);
  
  return (
    <div className="space-y-6">
      {/* Contact Info */}
      <div className="bg-[var(--color-secondary)]/40 backdrop-blur-xl rounded-2xl p-6 border border-[var(--color-secondary)]/50 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-[var(--color-highlight)] rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-[var(--color-text)]" />
          </div>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-[var(--color-text)] to-[var(--color-muted)] bg-clip-text text-transparent">
            Contact Info
          </h3>
        </div>
        <div className="space-y-4">
          {user.email && (
            <div className="flex items-center space-x-4 p-3 bg-[var(--color-secondary)]/30 rounded-xl border border-[var(--color-secondary)]/30 hover:bg-[var(--color-secondary)]/50 transition-all duration-300">
              <Mail className="w-5 h-5 text-cyan-400" />
              <span className="text-[var(--color-muted)] text-sm">{user.email}</span>
            </div>
          )}
          {user.phone && (
            <div className="flex items-center space-x-4 p-3 bg-[var(--color-secondary)]/30 rounded-xl border border-[var(--color-secondary)]/30 hover:bg-[var(--color-secondary)]/50 transition-all duration-300">
              <Phone className="w-5 h-5 text-[var(--color-accent)]" />
              <span className="text-[var(--color-muted)] text-sm">{user.phone}</span>
            </div>
          )}
          {user.location && (
            <div className="flex items-center space-x-4 p-3 bg-[var(--color-secondary)]/30 rounded-xl border border-[var(--color-secondary)]/30 hover:bg-[var(--color-secondary)]/50 transition-all duration-300">
              <MapPin className="w-5 h-5 text-red-400" />
              <span className="text-[var(--color-muted)] text-sm">{user.location}</span>
            </div>
          )}
          {user.website && (
            <div className="flex items-center space-x-4 p-3 bg-[var(--color-secondary)]/30 rounded-xl border border-[var(--color-secondary)]/30 hover:bg-[var(--color-secondary)]/50 transition-all duration-300">
              <Globe className="w-5 h-5 text-[var(--color-highlight)]" />
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-highlight)] hover:text-[var(--color-highlight)] text-sm transition-colors"
              >
                Visit Website
              </a>
            </div>
          )}
          {user.dateOfBirth && (
            <div className="flex items-center space-x-4 p-3 bg-[var(--color-secondary)]/30 rounded-xl border border-[var(--color-secondary)]/30 hover:bg-[var(--color-secondary)]/50 transition-all duration-300">
              <Calendar className="w-5 h-5 text-[var(--color-highlight)]" />
              <span className="text-[var(--color-muted)] text-sm">
                {new Date(user.dateOfBirth).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interests */}
      {user.interests && user.interests.length > 0 && (
        <div className="bg-[var(--color-secondary)]/40 backdrop-blur-xl rounded-2xl p-6 border border-[var(--color-secondary)]/50 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-[var(--color-highlight)] to-[var(--color-accent)] rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-[var(--color-text)]" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-[var(--color-text)] to-[var(--color-muted)] bg-clip-text text-transparent">
              Interests
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {user.interests.map((interest, index) => (
              <span
                key={index}
                className="bg-gradient-to-r from-[var(--color-highlight)] to-[var(--color-accent)] text-[var(--color-text)] px-4 py-2 rounded-xl text-sm font-medium shadow-lg hover:scale-105 transition-transform duration-300"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Social Links */}
      {user.socialLinks && Object.values(user.socialLinks).some((link) => link) && (
        <div className="bg-gradient-to-br from-[var(--color-secondary)]/40 to-[var(--color-primary)]/40 backdrop-blur-xl rounded-2xl p-6 border border-[var(--color-secondary)]/50 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-highlight)] rounded-xl flex items-center justify-center">
              <i className="ri-share-forward-line text-[var(--color-text)] text-lg"></i>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-[var(--color-text)] to-[var(--color-muted)] bg-clip-text text-transparent">
              Connect With Me
            </h3>
          </div>
          <div className="space-y-3">
            {[
              { platform: 'twitter', icon: 'ri-twitter-fill', color: 'from-blue-400 to-blue-500', bg: 'bg-[var(--color-secondary)]/20', border: 'border-[var(--color-highlight)]/20' },
              { platform: 'instagram', icon: 'ri-instagram-fill', color: 'from-pink-400 to-rose-500', bg: 'bg-pink-500/20', border: 'border-pink-500/20' },
              { platform: 'linkedin', icon: 'ri-linkedin-fill', color: 'from-[var(--color-secondary)] to-[var(--color-highlight)]', bg: 'bg-[var(--color-secondary)]/20', border: 'border-blue-600/20' },
              { platform: 'github', icon: 'ri-github-fill', color: 'from-gray-400 to-[var(--color-secondary)]', bg: 'bg-gray-500/20', border: 'border-gray-500/20' }
            ].map((social) => (
              user.socialLinks[social.platform] && (
                <a
                  key={social.platform}
                  href={user.socialLinks[social.platform]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center space-x-4 p-4 rounded-xl ${social.bg} ${social.border} border hover:scale-[1.02] transition-all duration-300 group hover:shadow-lg`}
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${social.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <i className={`${social.icon} text-[var(--color-text)] text-xl`}></i>
                  </div>
                  <span className={`font-semibold bg-gradient-to-r ${social.color} bg-clip-text text-transparent text-lg`}>
                    {social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
                  </span>
                </a>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSideBar;