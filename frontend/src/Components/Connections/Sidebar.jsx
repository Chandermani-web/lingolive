import 'remixicon/fonts/remixicon.css';

const Sidebar = ({ setdisplayName, displayName }) => {
  return (
    <div className='bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-secondary)] md:rounded-2xl hidden md:block'>
        <div className='flex flex-col bg-[var(--color-highlight)]/5 border border-[var(--color-secondary)]/30 md:rounded-2xl'>
            
            <button className={`py-5 px-3 border-b border-[var(--color-secondary)]/30 leading-10 font-semibold text-[var(--color-text)] hover:bg-[var(--color-secondary)]/20 transition-all duration-300 ease-in-out hover:translate-x-2 group ${displayName === 1 ? "bg-gradient-to-br from-[var(--color-accent)] to-blue-500" : ""} rounded-t-2xl`} onClick={() => setdisplayName(1)}>
                <div className='flex items-center space-x-4'>
                    <div className='w-10 h-10 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg shadow-lg shadow-emerald-500/25 flex items-center justify-center group-hover:shadow-emerald-400/40 transition-all duration-300'>
                        <i className="ri-user-line text-[var(--color-text)] text-xs"></i>
                    </div>
                    <span>Connections</span>
                </div>
            </button>
            
            <button className={`py-5 px-3 border-b border-[var(--color-secondary)]/30 leading-10 font-semibold text-[var(--color-text)] hover:bg-purple-600/20 transition-all duration-300 ease-in-out hover:translate-x-2 group ${displayName === 2 ? "bg-gradient-to-br from-[var(--color-accent)] to-blue-500" : ""}`} onClick={() => setdisplayName(2)}>
                <div className='flex items-center space-x-4'>
                    <div className='w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg shadow-lg shadow-purple-500/25 flex items-center justify-center group-hover:shadow-purple-400/40 transition-all duration-300'>
                        <i className="ri-link-m text-[var(--color-text)] text-xs"></i>
                    </div>
                    <span>Your Friends</span>
                </div>
            </button>
            <button className={`py-5 px-3 border-b border-[var(--color-secondary)]/30 leading-10 font-semibold text-[var(--color-text)] hover:bg-[var(--color-accent)]/20 transition-all duration-300 ease-in-out hover:translate-x-2 group ${displayName === 3 ? "bg-gradient-to-br from-[var(--color-accent)] to-blue-500" : ""}  rounded-b-2xl`} onClick={() => setdisplayName(3)}>
                <div className='flex items-center space-x-4'>
                    <div className='w-10 h-10 bg-gradient-to-r from-green-400 to-[var(--color-highlight)] rounded-lg shadow-lg shadow-green-500/25 flex items-center justify-center group-hover:shadow-green-400/40 transition-all duration-300'>
                        <i className="ri-arrow-right-up-line text-[var(--color-text)] text-xs"></i>
                    </div>
                    <span>Followers and Followings</span>
                </div>
            </button>
        </div>

        <div>
            {/* Additional content can be added here if needed */}

        </div>
    </div>
  )
}

export default Sidebar