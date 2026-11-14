with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add deviceMode state
target_state = '  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(true);'
replacement_state = '''  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(true);
  const [deviceMode, setDeviceMode] = useState<"mobile" | "fluid">("mobile");'''

assert target_state in c, 'target_state not found'
c = c.replace(target_state, replacement_state)

# 2. Add device switcher & mobile frame chassis
target_container = '<div className="max-w-2xl mx-auto px-4">'
replacement_container = '''{/* Device Switcher Bar on Desktop */}
      <div className="hidden sm:flex justify-center mb-3">
        <div className="bg-white/90 backdrop-blur-md p-1 rounded-full border border-slate-200/80 shadow-xs flex items-center gap-1 text-xs font-bold text-slate-600">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Aperçu :</span>
          <button
            type="button"
            onClick={() => setDeviceMode("mobile")}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              deviceMode === "mobile"
                ? "bg-[#0F172A] text-white shadow-xs"
                : "hover:text-[#0F172A]"
            }`}
          >
            iPhone 16 Pro (393px)
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode("fluid")}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              deviceMode === "fluid"
                ? "bg-[#0F172A] text-white shadow-xs"
                : "hover:text-[#0F172A]"
            }`}
          >
            Plein écran
          </button>
        </div>
      </div>

      <div className={`transition-all duration-300 mx-auto ${
        deviceMode === "mobile"
          ? "w-[393px] max-w-full my-2 sm:my-4 bg-[#0B0F17] rounded-[52px] p-[10px] shadow-2xl border-2 border-[#1E293B]"
          : "max-w-2xl px-4"
      }`}>
        {deviceMode === "mobile" && (
          <div className="relative">
            {/* Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-end pr-2.5 shadow-sm pointer-events-none">
              <div className="w-2.5 h-2.5 rounded-full bg-[#111827] border border-[#1F2937]" />
            </div>
            {/* iOS Status Bar */}
            <div className="h-10 bg-[#FAF8F5] rounded-t-[42px] px-6 flex items-center justify-between text-xs font-bold text-[#0F172A] pt-1">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-[10px] text-slate-500 font-black">5G</span>
              </div>
            </div>
          </div>
        )}

        <div className={deviceMode === "mobile" ? "bg-[#FAF8F5] rounded-b-[42px] px-3.5 pb-24 overflow-x-hidden min-h-[780px]" : "pb-24"}>'''

assert target_container in c, 'target_container not found'
c = c.replace(target_container, replacement_container)

# 3. Close the inner div of mobile frame
target_close = '''      </div>

      {/* DISH DETAIL MODAL (JOW STYLE AVEC SÉLECTION DE JOUR) */}'''

replacement_close = '''        </div>
      </div>

      {/* DISH DETAIL MODAL (JOW STYLE AVEC SÉLECTION DE JOUR) */}'''

assert target_close in c, 'target_close not found'
c = c.replace(target_close, replacement_close)

# 4. Dock container alignment with mobile frame
old_dock = '<div className="fixed bottom-5 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">'
new_dock = '<div className={`fixed bottom-5 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none ${deviceMode === "mobile" ? "max-w-[393px] mx-auto" : ""}`}>\n'

assert old_dock in c, 'old_dock not found'
c = c.replace(old_dock, new_dock)

with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated src/app/page.tsx with mobile frame switcher!')
