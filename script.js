// MVP калькулятор аудитории — mock-данные, без backend

const agePresetsContainer = document.getElementById("age-presets");
const ageFromSelect = document.getElementById("age-from");
const ageToSelect = document.getElementById("age-to");
const platformGroup = document.getElementById("platform-group");
const geoSearchInput = document.getElementById("geo-search");
const geoChipsContainer = document.getElementById("geo-chips");
const dateStartInput = document.getElementById("date-start");
const dateEndInput = document.getElementById("date-end");

const audienceSizeEl = document.getElementById("audience-size");
const clicksRangeEl = document.getElementById("clicks-range");
const impressionsRangeEl = document.getElementById("impressions-range");

const AGE_PRESET_VALUES = {
  all: { min: 18, max: 65 },
  "18-24": { min: 18, max: 24 },
  "25-44": { min: 25, max: 44 },
  "45+": { min: 45, max: 65 },
};

// Внутренняя модель: доля показов по платформе (пользователь не видит)
const PLATFORM_FACTORS = { all: 1, ios: 0.35, android: 0.65 };

const selectedRegions = new Set();
const selectedBehavior = new Set();

let socialMarriage = null;
let socialKids = null;
let selectedGender = null;
let socialSelfEmployed = false;
const selectedIncome = new Set();

const BEHAVIOR_CATEGORIES = [
  "Продукты и супермаркеты", "Одежда и обувь", "Электроника и техника", "Дом и ремонт",
  "Авто и обслуживание", "Путешествия и билеты", "Образование и курсы", "Здоровье и аптеки",
  "Дети и товары для семьи", "Развлечения и подписки", "Финансовые услуги", "Кафе и рестораны",
  "Маркетплейсы", "Красота и уход", "Спорт и фитнес", "Цифровые сервисы",
  "Моб. связь и интернет", "Такси и каршеринг", "Онлайн-подписки", "Игры и развлечения",
];

const geoDropdown = document.getElementById("geo-dropdown");
const geoClearBtn = document.getElementById("geo-clear-btn");
const geoRegionsCountEl = document.getElementById("geo-regions-count");
const geoSelectedBlock = document.getElementById("geo-selected-block");

const GEO_RUSSIA = "Россия";

const REGIONS = [
  "Алтайский край", "Амурская область", "Архангельская область", "Астраханская область",
  "Белгородская область", "Брянская область", "Владимирская область", "Волгоградская область",
  "Вологодская область", "Воронежская область", "Донецкая Народная Республика", "Еврейская автономная область",
  "Забайкальский край", "Запорожская область", "Ивановская область", "Иркутская область",
  "Кабардино-Балкарская Республика", "Калининградская область", "Калужская область", "Камчатский край",
  "Карачаево-Черкесская Республика", "Кемеровская область", "Кировская область", "Костромская область",
  "Краснодарский край", "Красноярский край", "Курганская область", "Курская область",
  "Ленинградская область", "Липецкая область", "Луганская Народная Республика", "Магаданская область",
  "Москва", "Московская область", "Мурманская область", "Ненецкий автономный округ",
  "Нижегородская область", "Новгородская область", "Новосибирская область", "Омская область",
  "Оренбургская область", "Орловская область", "Пензенская область", "Пермский край",
  "Приморский край", "Псковская область", "Республика Адыгея", "Республика Алтай",
  "Республика Башкортостан", "Республика Бурятия", "Республика Дагестан", "Республика Ингушетия",
  "Республика Калмыкия", "Республика Карелия", "Республика Коми", "Республика Крым",
  "Республика Марий Эл", "Республика Мордовия", "Республика Саха (Якутия)", "Республика Северная Осетия — Алания",
  "Республика Татарстан", "Республика Тыва", "Республика Хакасия", "Ростовская область",
  "Рязанская область", "Самарская область", "Санкт-Петербург", "Саратовская область",
  "Сахалинская область", "Свердловская область", "Севастополь", "Смоленская область",
  "Ставропольский край", "Тамбовская область", "Тверская область", "Томская область",
  "Тульская область", "Тюменская область", "Удмуртская Республика", "Ульяновская область",
  "Хабаровский край", "Ханты-Мансийский автономный округ — Югра", "Херсонская область",
  "Челябинская область", "Чеченская Республика", "Чувашская Республика", "Чукотский автономный округ",
  "Ямало-Ненецкий автономный округ", "Ярославская область",
];


function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function formatNumber(n) {
  return Math.round(n).toLocaleString("ru-RU");
}

const EN_DASH = "\u2013";

/** Форматирование одного значения для блока «Прогноз» */
function formatForecastValue(n, opts = {}) {
  const { estimate = false } = opts;
  const prefix = estimate ? "~ " : "";

  if (n < 10000) {
    const s = Math.round(n).toLocaleString("ru-RU");
    return prefix + s;
  }
  if (n < 1000000) {
    const k = Math.round(n / 1000);
    return prefix + k + " тыс.";
  }
  const m = Math.round(n / 100000) / 10;
  const mStr = m % 1 === 0 ? String(m) : m.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  return prefix + mStr + " млн";
}

/** Форматирование диапазона для блока «Прогноз» */
function formatForecastRange(min, max) {
  const useMillions = max >= 1000000;
  const useThousands = max >= 10000;

  if (!useThousands) {
    const minS = Math.round(min).toLocaleString("ru-RU");
    const maxS = Math.round(max).toLocaleString("ru-RU");
    return `${minS} ${EN_DASH} ${maxS}`;
  }

  if (useMillions) {
    const minM = Math.round(min / 100000) / 10;
    const maxM = Math.round(max / 100000) / 10;
    const minStr = minM % 1 === 0 ? String(minM) : minM.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
    const maxStr = maxM % 1 === 0 ? String(maxM) : maxM.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
    return `${minStr}${EN_DASH}${maxStr} млн`;
  }

  const minK = Math.round(min / 1000);
  const maxK = Math.round(max / 1000);
  return `${minK}${EN_DASH}${maxK} тыс.`;
}

function getEffectiveAgeRange() {
  const from = ageFromSelect ? parseInt(ageFromSelect.value, 10) : NaN;
  const to = ageToSelect ? parseInt(ageToSelect.value, 10) : NaN;
  if (!Number.isFinite(from) || !Number.isFinite(to)) return AGE_PRESET_VALUES.all;
  const min = clamp(Math.min(from, to), 18, 65);
  const max = clamp(Math.max(from, to), 18, 65);
  return { min, max };
}

function getPlatformFactor() {
  const ios = platformGroup?.querySelector('[data-platform="ios"]')?.classList.contains("segmented-item--active");
  const android = platformGroup?.querySelector('[data-platform="android"]')?.classList.contains("segmented-item--active");
  if (ios && android) return 1;
  if (ios) return PLATFORM_FACTORS.ios;
  if (android) return PLATFORM_FACTORS.android;
  return 1; /* нет выбора = все платформы */
}

function getGenderFactor() {
  if (!selectedGender) return 1;
  return selectedGender === "male" || selectedGender === "female" ? 0.5 : 1;
}

function parseDateDDMMYYYY(str) {
  if (!str || typeof str !== "string") return null;
  const m = str.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  const monthNum = parseInt(m[2], 10);
  if (monthNum < 1 || monthNum > 12) return null;
  const d = parseInt(m[1], 10);
  const month = monthNum - 1;
  const y = parseInt(m[3], 10);
  const date = new Date(y, month, d);
  if (date.getFullYear() !== y || date.getMonth() !== month || date.getDate() !== d) return null;
  return date;
}

function validateDateMonth(str) {
  if (!str || str.trim().length < 10) return { valid: true };
  const m = str.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return { valid: true };
  const month = parseInt(m[2], 10);
  if (month < 1 || month > 12) return { valid: false, error: "Некорректный месяц" };
  return { valid: true };
}

function formatDateInput(val) {
  const digits = String(val || "").replace(/\D/g, "").slice(0, 8);
  let out = "";
  if (digits.length > 0) out += digits.slice(0, 2);
  if (digits.length > 2) out += "." + digits.slice(2, 4);
  if (digits.length > 4) out += "." + digits.slice(4, 8);
  return out;
}

function getTodayDate() {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

function getMaxDate() {
  const t = new Date();
  return new Date(t.getFullYear() + 1, t.getMonth(), t.getDate());
}

function validateDateStart(str) {
  const monthCheck = validateDateMonth(str);
  if (!monthCheck.valid) return monthCheck;
  const date = parseDateDDMMYYYY(str);
  if (!date) return { valid: false, error: "" };
  const today = getTodayDate();
  const max = getMaxDate();
  if (date < today) return { valid: false, error: "Не может быть в прошлом" };
  if (date > max) return { valid: false, error: "Не более года вперёд" };
  return { valid: true, error: "" };
}

function validateDateEnd(str, startStr) {
  const monthCheck = validateDateMonth(str);
  if (!monthCheck.valid) return monthCheck;
  const date = parseDateDDMMYYYY(str);
  if (!date) return { valid: false, error: "" };
  const start = parseDateDDMMYYYY(startStr);
  const max = getMaxDate();
  if (start && date < start) return { valid: false, error: "Не может быть раньше даты начала" };
  if (date > max) return { valid: false, error: "Не более года вперёд" };
  return { valid: true, error: "" };
}

function syncDateErrors() {
  const startEl = document.getElementById("date-start-error");
  const endEl = document.getElementById("date-end-error");
  const startStr = dateStartInput?.value?.trim() || "";
  const endStr = dateEndInput?.value?.trim() || "";
  const startValid = startStr.length < 10 ? { valid: true } : validateDateStart(startStr);
  const endValid = endStr.length < 10 ? { valid: true } : validateDateEnd(endStr, startStr);
  if (startEl) startEl.textContent = startValid.error || "";
  if (endEl) endEl.textContent = endValid.error || "";
}

function syncDateClearVisibility() {
  const startClear = document.getElementById("date-start-clear");
  const endClear = document.getElementById("date-end-clear");
  if (startClear) startClear.hidden = !dateStartInput?.value?.trim();
  if (endClear) endClear.hidden = !dateEndInput?.value?.trim();
}

function syncDateDuration() {
  const textEl = document.getElementById("date-duration")?.querySelector(".date-duration-text");
  const days = getCampaignDurationForDisplay();
  if (!textEl) return;
  const word = days === null ? "" : (days % 10 === 1 && days % 100 !== 11 ? "день" : days % 10 >= 2 && days % 10 <= 4 && (days % 100 < 10 || days % 100 >= 20) ? "дня" : "дней");
  textEl.textContent = days === null ? "" : `Длительность: ${days} ${word}`;
}

function getCampaignDays() {
  const days = getCampaignDurationForDisplay();
  return days ?? 30;
}

/** Возвращает количество календарных дней (включая оба крайних) или null, если даты невалидны/не заполнены */
function getCampaignDurationForDisplay() {
  const startStr = dateStartInput?.value?.trim() || "";
  const endStr = dateEndInput?.value?.trim() || "";
  if (!startStr || !endStr || startStr.length < 10 || endStr.length < 10) return null;
  const start = parseDateDDMMYYYY(startStr);
  const end = parseDateDDMMYYYY(endStr);
  if (!start || !end || end < start) return null;
  const startErr = validateDateStart(startStr);
  const endErr = validateDateEnd(endStr, startStr);
  if (!startErr.valid || !endErr.valid) return null;
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function isRussiaSelected() {
  return selectedRegions.has(GEO_RUSSIA);
}

function getGeoFactor() {
  if (selectedRegions.size === 0) return 1;
  if (isRussiaSelected()) return 1;
  const n = selectedRegions.size;
  return clamp(0.25 + 0.65 * Math.min(n / 4, 1), 0.25, 0.95);
}

function getSocialNarrowness() {
  let n = 0;
  if (socialMarriage) n++;
  if (socialKids) n++;
  if (socialSelfEmployed) n++;
  n += selectedIncome.size;
  return n;
}

function getBehaviorFactor() {
  const n = selectedBehavior.size;
  if (n === 0) return { reach: 1, ctrBoost: 0 };
  const reachFactor = Math.max(0.5, 1 - n * 0.04);
  const ctrBoost = n * 0.002;
  return { reach: reachFactor, ctrBoost };
}

function recalculate() {
  const { min: ageMin, max: ageMax } = getEffectiveAgeRange();
  const platformFactor = getPlatformFactor();
  const geoFactor = getGeoFactor();
  const genderFactor = getGenderFactor();
  const { reach: behaviorReachFactor, ctrBoost: behaviorCtrBoost } = getBehaviorFactor();
  const campaignDays = getCampaignDays();
  const durationScale = campaignDays / 30;

  const socialNarrowness = getSocialNarrowness();
  const interests = clamp(60 - socialNarrowness * 7, 5, 100);

  const ageSpan = ageMax - ageMin;
  const ageFactor = clamp((ageSpan / 55) ** 0.8, 0.06, 1);
  const interestsFactor = 0.35 + (interests / 100) * 0.75;

  const audienceSizeK = clamp(
    550 * ageFactor * geoFactor * interestsFactor * platformFactor,
    20,
    800
  );
  const freq = 3 + (interests / 100) * 4;
  const reach = audienceSizeK * 1000 * freq * durationScale * genderFactor * behaviorReachFactor;

  const normSize = clamp((audienceSizeK - 50) / 450, 0, 1);
  const narrowness = 1 - normSize;
  const baseCtr = 0.005 + (interests / 100) * 0.025 + behaviorCtrBoost;
  const clicks = reach * baseCtr;

  const spread = 0.18;
  const reachMin = reach * (1 - spread);
  const reachMax = reach * (1 + spread);
  const clicksMin = clicks * (1 - spread);
  const clicksMax = clicks * (1 + spread);

  const audienceCount = audienceSizeK * 1000;
  audienceSizeEl.textContent = formatForecastValue(audienceCount, { estimate: true });
  impressionsRangeEl.textContent = formatForecastRange(reachMin, reachMax);
  clicksRangeEl.textContent = formatForecastRange(clicksMin, clicksMax);

  const forecastPanel = document.getElementById("panel-forecast");
  if (forecastPanel) {
    forecastPanel.classList.add("is-updating");
    clearTimeout(forecastPanel._updateTimeout);
    forecastPanel._updateTimeout = setTimeout(() => {
      forecastPanel.classList.remove("is-updating");
    }, 180);
  }
}

function handleChange() {
  recalculate();
}

// Заполнение селектов возраста
function fillAgeSelects() {
  const opt = (v) => {
    const o = document.createElement("option");
    o.value = String(v);
    o.textContent = v;
    return o;
  };
  const empty = () => {
    const o = document.createElement("option");
    o.value = "";
    o.textContent = "—";
    return o;
  };
  if (ageFromSelect) {
    ageFromSelect.innerHTML = "";
    ageFromSelect.appendChild(empty());
    for (let i = 18; i <= 65; i++) ageFromSelect.appendChild(opt(i));
    ageFromSelect.value = "18";
  }
  if (ageToSelect) {
    ageToSelect.innerHTML = "";
    ageToSelect.appendChild(empty());
    for (let i = 18; i <= 65; i++) ageToSelect.appendChild(opt(i));
    ageToSelect.value = "65";
  }
}
fillAgeSelects();

// Пресеты возраста: клик выбирает, повторный — снимает (18–65)
if (agePresetsContainer && ageFromSelect && ageToSelect) {
  agePresetsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".age-preset");
    if (!btn) return;
    const range = AGE_PRESET_VALUES[btn.dataset.agePreset];
    if (!range) return;
    const wasActive = btn.classList.contains("age-preset--active");
    agePresetsContainer.querySelectorAll(".age-preset").forEach((b) => b.classList.remove("age-preset--active"));
    if (wasActive) {
      ageFromSelect.value = "18";
      ageToSelect.value = "65";
    } else {
      btn.classList.add("age-preset--active");
      ageFromSelect.value = String(range.min);
      ageToSelect.value = String(range.max);
    }
    handleChange();
  });
}

function syncAgeManual() {
  const from = parseInt(ageFromSelect.value, 10);
  const to = parseInt(ageToSelect.value, 10);
  if (Number.isFinite(from) && Number.isFinite(to) && from > to) {
    ageFromSelect.value = String(to);
    ageToSelect.value = String(from);
  }
}
function deselectAgePreset() {
  agePresetsContainer?.querySelectorAll(".age-preset").forEach((b) => b.classList.remove("age-preset--active"));
}
ageFromSelect?.addEventListener("change", () => { deselectAgePreset(); syncAgeManual(); handleChange(); });
ageToSelect?.addEventListener("change", () => { deselectAgePreset(); syncAgeManual(); handleChange(); });

// Платформа устройств: клик выбирает, повторный — снимает
if (platformGroup) {
  platformGroup.addEventListener("click", (e) => {
    const t = e.target.closest(".segmented-item");
    if (!t) return;
    const wasActive = t.classList.contains("segmented-item--active");
    if (wasActive) {
      t.classList.remove("segmented-item--active");
    } else {
      t.classList.add("segmented-item--active");
    }
    handleChange();
  });
}

function setupDragSelection(options) {
  const { container, tileSelector, getValue, isSelected, setSelected, updateTile, onChanged } = options;
  if (!container) return;
  let dragMode = false;
  let hasMoved = false;

  function applyToTile(tile, mode) {
    const v = getValue(tile);
    if (!v) return;
    setSelected(v, mode);
    updateTile(tile);
  }

  function onMouseDown(e) {
    const tile = e.target.closest(tileSelector);
    if (!tile) return;
    e.preventDefault();
    hasMoved = false;
    dragMode = !isSelected(tile);
    applyToTile(tile, dragMode);
    document.body.classList.add("is-dragging-tiles");
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e) {
    hasMoved = true;
    const tiles = document.elementsFromPoint(e.clientX, e.clientY).filter((el) => el.matches?.(tileSelector));
    tiles.forEach((tile) => applyToTile(tile, dragMode));
  }

  function onMouseUp() {
    document.body.classList.remove("is-dragging-tiles");
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    onChanged();
  }

  container.addEventListener("mousedown", onMouseDown);
}

// Покупательское поведение
const behaviorGrid = document.getElementById("behavior-grid");
const behaviorResetBtn = document.getElementById("behavior-reset");

function syncBehaviorResetVisibility() {
  if (behaviorResetBtn) behaviorResetBtn.hidden = selectedBehavior.size === 0;
}

function renderBehaviorTiles() {
  if (!behaviorGrid) return;
  behaviorGrid.innerHTML = "";
  BEHAVIOR_CATEGORIES.forEach((label) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "behavior-tile" + (selectedBehavior.has(label) ? " behavior-tile--selected" : "");
    btn.dataset.behaviorLabel = label;
    btn.title = label;
    btn.innerHTML = `<span class="behavior-tile__text">${escapeHtml(label)}</span>`;
    behaviorGrid.appendChild(btn);
  });
  syncBehaviorResetVisibility();
}

behaviorResetBtn?.addEventListener("click", () => {
  selectedBehavior.clear();
  renderBehaviorTiles();
  handleChange();
});

renderBehaviorTiles();

setupDragSelection({
  container: behaviorGrid,
  tileSelector: ".behavior-tile",
  getValue: (t) => t.dataset.behaviorLabel,
  isSelected: (t) => selectedBehavior.has(t.dataset.behaviorLabel),
  setSelected: (v, on) => { if (on) selectedBehavior.add(v); else selectedBehavior.delete(v); },
  updateTile: (t) => t.classList.toggle("behavior-tile--selected", selectedBehavior.has(t.dataset.behaviorLabel)),
  onChanged: () => { syncBehaviorResetVisibility(); handleChange(); },
});

// География — поиск и добавление регионов
function pluralizeRegion(n) {
  return n % 10 === 1 && n % 100 !== 11 ? "выбран" : "выбрано";
}

const geoRegionsResetBtn = document.getElementById("geo-regions-reset");

const geoRussiaHint = document.getElementById("geo-russia-hint");

function syncGeoRegionsCount() {
  const n = selectedRegions.size;
  if (geoRegionsCountEl) geoRegionsCountEl.textContent = n >= 1 ? `${n} ${pluralizeRegion(n)}` : "";
  if (geoSelectedBlock) geoSelectedBlock.hidden = n < 1;
  if (geoRegionsResetBtn) geoRegionsResetBtn.hidden = n < 1;
}

function syncGeoRussiaState() {
  const russia = isRussiaSelected();
  if (geoSearchInput) geoSearchInput.disabled = russia;
  if (geoRussiaHint) geoRussiaHint.hidden = !russia;
  if (russia && geoSearchInput) {
    geoSearchInput.value = "";
    syncGeoClearVisibility();
    closeGeoDropdown();
  }
}

const geoHintBlock = document.getElementById("geo-hint-block");

function syncGeoVisibility() {
  const n = selectedRegions.size;
  if (geoHintBlock) geoHintBlock.hidden = n > 0;
  syncGeoRegionsCount();
}

function renderGeoChips() {
  if (!geoChipsContainer) return;
  geoChipsContainer.innerHTML = "";
  const items = isRussiaSelected() ? [GEO_RUSSIA] : Array.from(selectedRegions);
  items.forEach((name) => {
    const chip = document.createElement("div");
    chip.className = "geo-chip";
    chip.innerHTML = `<span>${escapeHtml(name)}</span><button type="button" class="geo-chip-remove">×</button>`;
    chip.querySelector(".geo-chip-remove").addEventListener("click", () => {
      selectedRegions.delete(name);
      renderGeoChips();
      syncGeoRussiaState();
      handleChange();
    });
    geoChipsContainer.appendChild(chip);
  });
  syncGeoVisibility();
  syncGeoRussiaState();
  syncGeoPresetActive?.();
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function addRegion(name) {
  const n = String(name).trim();
  if (!n || selectedRegions.has(n)) return;
  if (isRussiaSelected()) return;
  if (!REGIONS.includes(n)) return;
  selectedRegions.add(n);
  renderGeoChips();
  handleChange();
}

function filterRegions(query) {
  const q = query.trim().toLowerCase();
  if (q.length < 3) return [];
  return REGIONS.filter((r) => r.toLowerCase().includes(q));
}

function showGeoDropdown(matches) {
  if (!geoDropdown) return;
  geoDropdown.innerHTML = "";
  geoDropdown.hidden = true;
  if (isRussiaSelected() || !matches.length) return;
  const rect = geoSearchInput.getBoundingClientRect();
  geoDropdown.style.top = `${rect.bottom + 2}px`;
  geoDropdown.style.left = `${rect.left}px`;
  geoDropdown.style.width = `${rect.width}px`;
  matches.forEach((region) => {
    if (selectedRegions.has(region)) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "geo-dropdown-item";
    btn.textContent = region;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      addRegion(region);
      geoSearchInput.value = "";
      syncGeoClearVisibility();
      closeGeoDropdown();
      handleChange();
    });
    geoDropdown.appendChild(btn);
  });
  geoDropdown.hidden = geoDropdown.children.length === 0;
}

function closeGeoDropdown() {
  if (geoDropdown) geoDropdown.hidden = true;
}

function syncGeoClearVisibility() {
  if (geoClearBtn) {
    geoClearBtn.hidden = !geoSearchInput?.value.trim();
  }
}

geoRegionsResetBtn?.addEventListener("click", () => {
  selectedRegions.clear();
  if (geoSearchInput) geoSearchInput.value = "";
  closeGeoDropdown();
  syncGeoClearVisibility();
  renderGeoChips();
  handleChange();
});

if (geoSearchInput) {
  geoSearchInput.addEventListener("input", () => {
    if (isRussiaSelected()) return;
    syncGeoClearVisibility();
    const matches = filterRegions(geoSearchInput.value);
    showGeoDropdown(matches);
  });
  geoSearchInput.addEventListener("focus", () => {
    if (isRussiaSelected()) return;
    syncGeoClearVisibility();
    const matches = filterRegions(geoSearchInput.value);
    showGeoDropdown(matches);
  });
  geoSearchInput.addEventListener("blur", () => {
    setTimeout(closeGeoDropdown, 150);
  });
}

if (geoClearBtn) {
  geoClearBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    geoSearchInput.value = "";
    closeGeoDropdown();
    syncGeoClearVisibility();
    geoSearchInput.focus();
  });
}

const geoPresets = document.getElementById("geo-presets");
function syncGeoPresetActive() {
  geoPresets?.querySelectorAll(".geo-preset-btn").forEach((b) => {
    const preset = b.dataset.geoPreset;
    let active = false;
    if (preset === "russia" && isRussiaSelected()) active = true;
    else if (preset === "moscow" && selectedRegions.size === 1 && selectedRegions.has("Москва")) active = true;
    else if (preset === "spb" && selectedRegions.size === 1 && selectedRegions.has("Санкт-Петербург")) active = true;
    b.classList.toggle("geo-preset-btn--active", active);
  });
}
if (geoPresets) {
  geoPresets.addEventListener("click", (e) => {
    const btn = e.target.closest(".geo-preset-btn");
    if (!btn) return;
    const preset = btn.dataset.geoPreset;
    if (preset === "russia") {
      selectedRegions.clear();
      selectedRegions.add(GEO_RUSSIA);
    } else if (preset === "moscow") {
      selectedRegions.clear();
      selectedRegions.add("Москва");
    } else if (preset === "spb") {
      selectedRegions.clear();
      selectedRegions.add("Санкт-Петербург");
    }
    renderGeoChips();
    syncGeoPresetActive();
    handleChange();
  });
}
syncGeoPresetActive();

syncGeoVisibility();

// Период кампании
function applyDateMask(el) {
  if (!el) return;
  const oldVal = el.value;
  const newVal = formatDateInput(oldVal);
  if (newVal !== oldVal) el.value = newVal;
}

[dateStartInput, dateEndInput].forEach((el) => {
  el?.addEventListener("input", () => {
    applyDateMask(el);
    syncDateErrors();
    syncDateClearVisibility();
    syncDateDuration();
    handleChange();
  });
  el?.addEventListener("paste", (e) => {
    e.preventDefault();
    const text = (e.clipboardData?.getData("text") || "").replace(/\D/g, "").slice(0, 8);
    const formatted = formatDateInput(text);
    el.value = formatted;
    syncDateErrors();
    syncDateClearVisibility();
    syncDateDuration();
    handleChange();
  });
  el?.addEventListener("keypress", (e) => {
    if (e.key.length === 1 && !/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault();
  });
});

// Крестики очистки полей дат
const dateStartClear = document.getElementById("date-start-clear");
const dateEndClear = document.getElementById("date-end-clear");
dateStartClear?.addEventListener("mousedown", (e) => {
  e.preventDefault();
  if (dateStartInput) {
    dateStartInput.value = "";
    dateStartInput.focus();
    syncDateErrors();
    syncDateClearVisibility();
    syncDateDuration();
    handleChange();
  }
});
dateEndClear?.addEventListener("mousedown", (e) => {
  e.preventDefault();
  if (dateEndInput) {
    dateEndInput.value = "";
    dateEndInput.focus();
    syncDateErrors();
    syncDateClearVisibility();
    syncDateDuration();
    handleChange();
  }
});

// Пол
const genderGroup = document.getElementById("gender-group");
if (genderGroup) {
  genderGroup.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-gender]");
    if (!btn) return;
    const g = btn.dataset.gender;
    selectedGender = selectedGender === g ? null : g;
    genderGroup.querySelectorAll("[data-gender]").forEach((b) =>
      b.classList.toggle("social-tile--selected", b.dataset.gender === selectedGender)
    );
    handleChange();
  });
}

// Социальные характеристики — inline плитки
function isSocialDefault() {
  return !socialMarriage && !socialKids && !socialSelfEmployed && selectedIncome.size === 0;
}

function syncSocialResetVisibility() {
  const resetBtn = document.getElementById("social-reset");
  if (resetBtn) resetBtn.hidden = isSocialDefault();
}

const socialMarriageGroup = document.getElementById("social-marriage");
if (socialMarriageGroup) {
  socialMarriageGroup.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-social-marriage]");
    if (!btn) return;
    const v = btn.dataset.socialMarriage;
    socialMarriage = socialMarriage === v ? null : v;
    socialMarriageGroup.querySelectorAll("[data-social-marriage]").forEach((b) =>
      b.classList.toggle("social-tile--selected", b.dataset.socialMarriage === socialMarriage)
    );
    syncSocialResetVisibility();
    handleChange();
  });
}

const socialKidsGroup = document.getElementById("social-kids");
if (socialKidsGroup) {
  socialKidsGroup.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-social-kids]");
    if (!btn) return;
    const v = btn.dataset.socialKids;
    socialKids = socialKids === v ? null : v;
    socialKidsGroup.querySelectorAll("[data-social-kids]").forEach((b) =>
      b.classList.toggle("social-tile--selected", b.dataset.socialKids === socialKids)
    );
    syncSocialResetVisibility();
    handleChange();
  });
}

const socialSelfEmployedBtn = document.getElementById("social-selfemployed");
if (socialSelfEmployedBtn) {
  socialSelfEmployedBtn.addEventListener("click", () => {
    socialSelfEmployed = !socialSelfEmployed;
    socialSelfEmployedBtn.classList.toggle("social-tile--selected", socialSelfEmployed);
    syncSocialResetVisibility();
    handleChange();
  });
}

const socialIncomeGroup = document.getElementById("social-income");
if (socialIncomeGroup) {
  setupDragSelection({
    container: socialIncomeGroup,
    tileSelector: "[data-social-income]",
    getValue: (t) => t.dataset.socialIncome,
    isSelected: (t) => selectedIncome.has(t.dataset.socialIncome),
    setSelected: (v, on) => { if (on) selectedIncome.add(v); else selectedIncome.delete(v); },
    updateTile: (t) => t.classList.toggle("social-tile--selected", selectedIncome.has(t.dataset.socialIncome)),
    onChanged: () => { syncSocialResetVisibility(); handleChange(); },
  });
}

const socialResetBtn = document.getElementById("social-reset");
socialResetBtn?.addEventListener("click", () => {
  socialMarriage = null;
  socialKids = null;
  socialSelfEmployed = false;
  selectedIncome.clear();
  socialMarriageGroup?.querySelectorAll("[data-social-marriage]").forEach((b) => b.classList.remove("social-tile--selected"));
  socialKidsGroup?.querySelectorAll("[data-social-kids]").forEach((b) => b.classList.remove("social-tile--selected"));
  socialSelfEmployedBtn?.classList.remove("social-tile--selected");
  socialIncomeGroup?.querySelectorAll("[data-social-income]").forEach((b) => b.classList.remove("social-tile--selected"));
  syncSocialResetVisibility();
  handleChange();
});

document.addEventListener("click", (e) => {
  if (!geoDropdown?.hidden) {
    if (!geoSearchInput?.contains(e.target) && !geoDropdown?.contains(e.target)) closeGeoDropdown();
  }
});

recalculate();
