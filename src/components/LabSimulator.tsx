import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Beaker, Flame, Snowflake, RotateCcw, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const LabSimulator: React.FC = () => {
  const [activeExp, setActiveExp] = useState<'no2' | 'ch3coona'>('no2');

  // Experiment 1 State
  const [tempModeNO2, setTempModeNO2] = useState<'cold' | 'room' | 'hot'>('room');

  // Experiment 2 State
  const [tempModeCH3COO, setTempModeCH3COO] = useState<'cold' | 'room' | 'hot'>('room');

  // Handlers
  const handleNO2Change = (mode: 'cold' | 'room' | 'hot') => {
    soundManager.playPop();
    setTempModeNO2(mode);
  };

  const handleCH3COOChange = (mode: 'cold' | 'room' | 'hot') => {
    soundManager.playPop();
    setTempModeCH3COO(mode);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      {/* Tab Switcher for the 2 SGK experiments */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Beaker className="w-5 h-5 text-teal-600" />
            Phòng Thí Nghiệm Ảo: Ảnh Hưởng Của Nhiệt Độ Đến Cân Bằng
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Mô phỏng trực quan 2 thí nghiệm SGK Hoá học 11 theo Yêu cầu cần đạt
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => {
              soundManager.playPop();
              setActiveExp('no2');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              activeExp === 'no2'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Thí nghiệm 1: 2NO₂ ⇌ N₂O₄
          </button>
          <button
            onClick={() => {
              soundManager.playPop();
              setActiveExp('ch3coona');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              activeExp === 'ch3coona'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Thí nghiệm 2: Thuỷ phân CH₃COONa
          </button>
        </div>
      </div>

      {/* Experiment 1: 2NO2 ⇌ N2O4 */}
      {activeExp === 'no2' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Canvas: Laboratory Simulation Graphic */}
          <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl p-6 text-white relative overflow-hidden flex flex-col items-center justify-center min-h-[380px]">
            {/* Ambient subtle grid */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Experiment apparatus */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Bath beaker wrapper */}
              <div className="relative w-56 h-64 border-2 border-slate-600/60 rounded-b-3xl bg-slate-800/40 backdrop-blur-xs flex items-center justify-center p-3">
                {/* Water or ice in bath */}
                <div
                  className={`absolute bottom-0 inset-x-0 rounded-b-[22px] transition-all duration-700 ${
                    tempModeNO2 === 'cold'
                      ? 'h-36 bg-cyan-500/20 border-t border-cyan-400/40'
                      : tempModeNO2 === 'hot'
                      ? 'h-40 bg-amber-500/20 border-t border-amber-400/40'
                      : 'h-32 bg-slate-600/20 border-t border-slate-500/30'
                  }`}
                >
                  {tempModeNO2 === 'cold' && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 text-cyan-200/50 text-xs font-formula">
                      <span>[ Nước đá 0°C ]</span>
                    </div>
                  )}
                  {tempModeNO2 === 'hot' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-300/60 text-xs font-formula">
                      <span>[ Nước nóng ~85°C ]</span>
                      <span className="text-[10px] text-amber-200/40">Bọt khí đối lưu</span>
                    </div>
                  )}
                  {tempModeNO2 === 'room' && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400/50 text-xs font-formula">
                      <span>[ Không ngâm - 25°C ]</span>
                    </div>
                  )}
                </div>

                {/* Inner Sealed Test Tube */}
                <div className="relative z-20 w-16 h-56 border-2 border-slate-300/80 rounded-b-2xl bg-white/5 backdrop-blur-md flex flex-col items-center justify-between p-1 overflow-hidden shadow-lg">
                  {/* Rubber stopper */}
                  <div className="w-14 h-4 bg-slate-700 border border-slate-500 rounded-t-xs -mt-1 shadow-sm" />

                  {/* Gas Color Gradient (transitions dynamically) */}
                  <motion.div
                    className="absolute inset-x-0 bottom-0 top-3 rounded-b-xl transition-colors duration-700"
                    style={{
                      backgroundColor:
                        tempModeNO2 === 'cold'
                          ? 'rgba(254, 240, 138, 0.15)' // nearly colorless / pale yellow
                          : tempModeNO2 === 'hot'
                          ? 'rgba(154, 52, 18, 0.92)' // dark reddish-brown
                          : 'rgba(217, 119, 6, 0.55)', // medium amber-brown
                    }}
                  />

                  {/* Gas label inside tube */}
                  <div className="relative z-30 text-center my-auto px-1">
                    <span className="text-[11px] font-bold font-formula text-white drop-shadow-md">
                      {tempModeNO2 === 'cold'
                        ? 'N₂O₄ chiếm ưu thế'
                        : tempModeNO2 === 'hot'
                        ? 'NO₂ chiếm ưu thế'
                        : 'Cân bằng 2NO₂ ⇌ N₂O₄'}
                    </span>
                    <div className="text-[10px] text-white/80 mt-1">
                      {tempModeNO2 === 'cold' && 'Màu nhạt dần (gần không màu)'}
                      {tempModeNO2 === 'room' && 'Màu nâu nhạt'}
                      {tempModeNO2 === 'hot' && 'Màu nâu đỏ đậm'}
                    </div>
                  </div>

                  {/* Bottom glass curve */}
                  <div className="w-full h-2" />
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-slate-300">Nhiệt độ hiện tại:</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-sm font-formula ${
                    tempModeNO2 === 'cold'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                      : tempModeNO2 === 'hot'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      : 'bg-slate-700 text-slate-200 border border-slate-600'
                  }`}
                >
                  {tempModeNO2 === 'cold' ? '0°C (Nước đá)' : tempModeNO2 === 'hot' ? '85°C (Nước nóng)' : '25°C (Nhiệt độ phòng)'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Controls & Scientific Explanation */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            <div>
              <div className="text-xs font-semibold text-teal-700 tracking-wider uppercase mb-1">
                Phương trình phản ứng & Nhiệt hoá học
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-formula text-sm text-slate-900 leading-relaxed">
                <div className="font-bold text-teal-900">
                  2NO₂ (khí, nâu đỏ) ⇌ N₂O₄ (khí, không màu)
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Δ<sub>r</sub>H°<sub>298</sub> = -58 kJ &lt; 0 (Chiều thuận toả nhiệt, chiều nghịch thu nhiệt)
                </div>
              </div>

              {/* Temperature Control Buttons */}
              <div className="mt-5">
                <div className="text-xs font-medium text-slate-700 mb-2">
                  Chọn môi trường thử nghiệm ống nghiệm:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleNO2Change('cold')}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      tempModeNO2 === 'cold'
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-900 ring-2 ring-cyan-400/20 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Snowflake className="w-4 h-4 mb-1 text-cyan-600" />
                    <span>Cốc nước đá</span>
                    <span className="text-[10px] text-slate-500 font-formula">0 °C</span>
                  </button>

                  <button
                    onClick={() => handleNO2Change('room')}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      tempModeNO2 === 'room'
                        ? 'border-teal-500 bg-teal-50 text-teal-900 ring-2 ring-teal-400/20 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4 mb-1 text-teal-600" />
                    <span>Nhiệt độ phòng</span>
                    <span className="text-[10px] text-slate-500 font-formula">25 °C</span>
                  </button>

                  <button
                    onClick={() => handleNO2Change('hot')}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      tempModeNO2 === 'hot'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-400/20 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Flame className="w-4 h-4 mb-1 text-amber-600" />
                    <span>Cốc nước nóng</span>
                    <span className="text-[10px] text-slate-500 font-formula">~85 °C</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Scientific Explanation */}
              <div className="mt-5 p-4 rounded-lg bg-teal-50/60 border border-teal-100 text-xs leading-relaxed text-teal-950">
                <div className="font-bold flex items-center gap-1.5 text-teal-900 mb-1">
                  <Info className="w-4 h-4 text-teal-600 shrink-0" />
                  Giải thích theo Nguyên lí Le Chatelier:
                </div>
                {tempModeNO2 === 'cold' && (
                  <div>
                    Khi ngâm vào <strong>nước đá</strong> (hạ nhiệt độ), cân bằng tự động dịch chuyển theo chiều <strong>toả nhiệt</strong> (chiều thuận) để bù lại nhiệt bị mất. Do đó [N₂O₄] tăng lên và [NO₂] giảm đi → <strong>Màu nâu đỏ nhạt dần chuyển sang gần như không màu</strong>.
                  </div>
                )}
                {tempModeNO2 === 'room' && (
                  <div>
                    Ở nhiệt độ phòng 25°C, hệ ở trạng thái cân bằng động chuẩn, tốc độ thuận bằng nghịch (v<sub>t</sub> = v<sub>n</sub>), hỗn hợp gồm cả NO₂ và N₂O₄ duy trì màu nâu nhạt ổn định.
                  </div>
                )}
                {tempModeNO2 === 'hot' && (
                  <div>
                    Khi ngâm vào <strong>nước nóng</strong> (tăng nhiệt độ), cân bằng tự động dịch chuyển theo chiều <strong>thu nhiệt</strong> (chiều nghịch) để làm giảm tác động của nhiệt độ cao. Do đó N₂O₄ phân li tạo thêm nhiều khí NO₂ → <strong>Màu nâu đỏ đậm dần lên rõ rệt</strong>.
                  </div>
                )}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-3 flex items-center justify-between">
              <span>Thí nghiệm 1 - SGK Hoá học 11</span>
              <span className="text-teal-700 font-medium">Cân bằng pha khí 2NO₂ ⇌ N₂O₄</span>
            </div>
          </div>
        </div>
      )}

      {/* Experiment 2: Sodium Acetate Hydrolysis */}
      {activeExp === 'ch3coona' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Canvas: Test tube with phenolphthalein color change */}
          <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl p-6 text-white relative overflow-hidden flex flex-col items-center justify-center min-h-[380px]">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative z-10 flex flex-col items-center">
              {/* Test Tube Holder & Tube */}
              <div className="relative flex flex-col items-center">
                {/* Test Tube */}
                <div className="relative w-20 h-64 border-2 border-slate-300/80 rounded-b-3xl bg-white/5 backdrop-blur-md flex flex-col justify-end p-1 overflow-hidden shadow-xl">
                  {/* Test tube rim */}
                  <div className="absolute top-0 inset-x-0 h-2 bg-slate-300/40 rounded-t-sm" />

                  {/* Liquid solution inside with dynamic pink intensity */}
                  <motion.div
                    className="w-full rounded-b-[22px] transition-all duration-700 relative overflow-hidden flex flex-col items-center justify-center text-center p-2"
                    style={{
                      height: '75%',
                      backgroundColor:
                        tempModeCH3COO === 'cold'
                          ? 'rgba(251, 207, 232, 0.25)' // almost colorless / very faint pink
                          : tempModeCH3COO === 'hot'
                          ? 'rgba(219, 39, 119, 0.85)' // vibrant magenta/deep pink
                          : 'rgba(244, 114, 182, 0.45)', // gentle medium pink
                    }}
                  >
                    {/* Bubbles if heated */}
                    {tempModeCH3COO === 'hot' && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <motion.div
                          animate={{ y: [40, -60], opacity: [0, 0.8, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                          className="w-2 h-2 rounded-full bg-white/40 absolute left-4 bottom-2"
                        />
                        <motion.div
                          animate={{ y: [50, -60], opacity: [0, 0.7, 0] }}
                          transition={{ repeat: Infinity, duration: 1.2, delay: 0.4, ease: 'linear' }}
                          className="w-1.5 h-1.5 rounded-full bg-white/40 absolute right-4 bottom-1"
                        />
                      </div>
                    )}

                    <span className="text-[11px] font-bold font-formula text-white drop-shadow-md">
                      CH₃COONa
                    </span>
                    <span className="text-[10px] text-white/90">
                      + Phenolphthalein
                    </span>
                    <span className="text-[9px] mt-1 font-semibold text-white/80">
                      {tempModeCH3COO === 'cold'
                        ? 'Hồng rất nhạt'
                        : tempModeCH3COO === 'hot'
                        ? 'Hồng đậm rực rỡ'
                        : 'Màu hồng nhạt'}
                    </span>
                  </motion.div>
                </div>

                {/* Heat source (Bunsen burner / alcohol burner) or Ice Bath */}
                <div className="h-16 flex items-center justify-center mt-2">
                  {tempModeCH3COO === 'hot' ? (
                    <div className="flex flex-col items-center">
                      <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.85, 1, 0.85] }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                      >
                        <Flame className="w-8 h-8 text-amber-500 fill-amber-400" />
                      </motion.div>
                      <span className="text-[10px] text-amber-300 font-formula">Ngọn lửa đèn cồn</span>
                    </div>
                  ) : tempModeCH3COO === 'cold' ? (
                    <div className="flex flex-col items-center">
                      <Snowflake className="w-6 h-6 text-cyan-300" />
                      <span className="text-[10px] text-cyan-200 font-formula">Cốc nước đá</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-formula">Giá đỡ ống nghiệm</span>
                  )}
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-slate-300">Trạng thái dung dịch:</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-sm font-formula ${
                    tempModeCH3COO === 'hot'
                      ? 'bg-pink-500/30 text-pink-300 border border-pink-400/30'
                      : tempModeCH3COO === 'cold'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                      : 'bg-slate-700 text-slate-200 border border-slate-600'
                  }`}
                >
                  {tempModeCH3COO === 'hot'
                    ? 'Đun nóng → [OH⁻] tăng cao'
                    : tempModeCH3COO === 'cold'
                    ? 'Làm lạnh → [OH⁻] giảm bớt'
                    : 'Bình thường → Base yếu'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Controls & Scientific Explanation */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            <div>
              <div className="text-xs font-semibold text-teal-700 tracking-wider uppercase mb-1">
                Phương trình ion thuỷ phân & Nhiệt hoá học
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-formula text-sm text-slate-900 leading-relaxed">
                <div className="font-bold text-teal-900">
                  CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Δ<sub>r</sub>H° &gt; 0 (Phản ứng thuận là phản ứng thu nhiệt)
                </div>
              </div>

              {/* Control Buttons */}
              <div className="mt-5">
                <div className="text-xs font-medium text-slate-700 mb-2">
                  Tác động nhiệt độ lên ống nghiệm:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleCH3COOChange('cold')}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      tempModeCH3COO === 'cold'
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-900 ring-2 ring-cyan-400/20 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Snowflake className="w-4 h-4 mb-1 text-cyan-600" />
                    <span>Làm lạnh</span>
                    <span className="text-[10px] text-slate-500 font-formula">Nước đá</span>
                  </button>

                  <button
                    onClick={() => handleCH3COOChange('room')}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      tempModeCH3COO === 'room'
                        ? 'border-teal-500 bg-teal-50 text-teal-900 ring-2 ring-teal-400/20 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4 mb-1 text-teal-600" />
                    <span>Để nguội</span>
                    <span className="text-[10px] text-slate-500 font-formula">25 °C</span>
                  </button>

                  <button
                    onClick={() => handleCH3COOChange('hot')}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      tempModeCH3COO === 'hot'
                        ? 'border-pink-500 bg-pink-50 text-pink-900 ring-2 ring-pink-400/20 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Flame className="w-4 h-4 mb-1 text-pink-600" />
                    <span>Đun nóng</span>
                    <span className="text-[10px] text-slate-500 font-formula">Đèn cồn</span>
                  </button>
                </div>
              </div>

              {/* Le Chatelier explanation */}
              <div className="mt-5 p-4 rounded-lg bg-pink-50/70 border border-pink-100 text-xs leading-relaxed text-pink-950">
                <div className="font-bold flex items-center gap-1.5 text-pink-900 mb-1">
                  <Info className="w-4 h-4 text-pink-600 shrink-0" />
                  Phân tích hiện tượng theo Le Chatelier:
                </div>
                {tempModeCH3COO === 'hot' && (
                  <div>
                    Khi <strong>đun nóng</strong> ống nghiệm (tăng nhiệt độ), cân bằng chuyển dịch theo chiều <strong>thu nhiệt (chiều thuận)</strong> để giảm nhiệt lượng cung cấp. Sự chuyển dịch này tạo ra nhiều ion <strong>OH⁻</strong> hơn → Thuốc thử phenolphthalein chuyển sang <strong>màu hồng đậm dần lên</strong>.
                  </div>
                )}
                {tempModeCH3COO === 'room' && (
                  <div>
                    Ở nhiệt độ thường, một lượng nhỏ CH₃COO⁻ thuỷ phân tạo môi trường bazơ yếu chứa ion OH⁻, làm dung dịch chuyển sang màu hồng nhạt.
                  </div>
                )}
                {tempModeCH3COO === 'cold' && (
                  <div>
                    Khi <strong>làm lạnh</strong> ống nghiệm trong nước đá (hạ nhiệt độ), cân bằng chuyển dịch theo chiều <strong>toả nhiệt (chiều nghịch)</strong>. Nồng độ ion OH⁻ giảm đi → <strong>Màu hồng nhạt dần và mờ đi rõ rệt</strong>.
                  </div>
                )}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-3 flex items-center justify-between">
              <span>Thí nghiệm 2 - SGK Hoá học 11</span>
              <span className="text-teal-700 font-medium">Thuỷ phân muối tạo môi trường kiềm</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
