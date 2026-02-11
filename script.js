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

const BEHAVIOR_PERIOD_OPTIONS = [10, 20, 30, 60, 90, 120, 180, 365];
const BEHAVIOR_PERIOD_MAIN = [30, 90, 180, 365];
const BEHAVIOR_PERIOD_EXTRA = [10, 20, 60, 120];
let behaviorPeriodDays = 90;

let socialMarriage = null;
let socialKids = null;
const selectedChildAges = new Set(); // key: 0-2 | 3-5 | 6-12 | 13-16
let selectedGender = null;
let socialSelfEmployed = false;
const selectedIncome = new Set();
let userType = null; // null | 'mass' | 'affluent'
const selectedBankProducts = new Set();

const PLACEMENTS = [
  { key: "banner_start", label: "Баннер на стартовой странице", desc: "Высокая видимость", cpm: 500, conversion: 0.015 },
  { key: "banner_history", label: "Баннер в историях операций", desc: "Контекстный момент", cpm: 400, conversion: 0.0075 },
  { key: "banner_success", label: "Баннер на экране успеха", desc: "После завершения действия", cpm: 450, conversion: 0.01 },
  { key: "window_start", label: "Окно на старте", desc: "Максимальный охват", cpm: 600, conversion: 0.02 },
];

const selectedPlacements = new Set();
const placementImpressions = {}; // key -> number
let campaignBudget = null; // number | null, rounded to 10000 on blur
const placementAutoFromBudget = new Set(); // keys of placements whose impressions were set by "Распределить равномерно"

const BANK_PRODUCT_GROUPS = [
  {
    label: "Кредиты",
    products: [
      { key: "credit_card", label: "Кредитная карта" },
      { key: "cash_loan", label: "Кредит наличными" },
      { key: "consumer_loan", label: "Потребительский кредит" },
      { key: "mortgage", label: "Ипотека" },
      { key: "auto_loan", label: "Автокредит" },
    ],
  },
  {
    label: "Накопления",
    products: [
      { key: "savings", label: "Накопительный счёт" },
      { key: "deposit", label: "Депозит" },
    ],
  },
  {
    label: "Инвестиции",
    products: [
      { key: "broker", label: "Брокерский счёт" },
      { key: "iis", label: "ИИС" },
      { key: "pds", label: "ПДС" },
    ],
  },
];

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
  if (days === null) {
    textEl.textContent = "Базовый период 30 дней";
  } else {
    const word = days % 10 === 1 && days % 100 !== 11 ? "день" : days % 10 >= 2 && days % 10 <= 4 && (days % 100 < 10 || days % 100 >= 20) ? "дня" : "дней";
    textEl.textContent = `Длительность: ${days} ${word}`;
  }
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
  const days = behaviorPeriodDays || 90;
  const periodScale = days / 90;
  const reachFromPeriod = 0.85 + periodScale * 0.15;
  const ctrFromPeriod = 1.15 - (periodScale - 0.5) * 0.1;
  return {
    reach: reachFactor * Math.min(1.1, reachFromPeriod),
    ctrBoost: ctrBoost * Math.max(0.9, Math.min(1.1, ctrFromPeriod)),
  };
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
  const hasRegions = selectedRegions.size > 0;
  if (hasRegions) {
    audienceSizeEl.textContent = formatForecastValue(audienceCount, { estimate: true });
    impressionsRangeEl.textContent = formatForecastRange(reachMin, reachMax);
    clicksRangeEl.textContent = formatForecastRange(clicksMin, clicksMax);
  } else {
    audienceSizeEl.textContent = "—";
    impressionsRangeEl.textContent = "—";
    clicksRangeEl.textContent = "—";
  }

  const forecastPanel = document.getElementById("panel-forecast");
  if (forecastPanel) {
    forecastPanel.classList.add("is-updating");
    clearTimeout(forecastPanel._updateTimeout);
    forecastPanel._updateTimeout = setTimeout(() => {
      forecastPanel.classList.remove("is-updating");
    }, 250);
  }
}

function syncEmptyStates() {
  const campaignNameEl = document.getElementById("campaign-name");
  const campaignEl = document.getElementById("empty-state-campaign");
  const regionsEl = document.getElementById("empty-state-regions");
  const regionsRussiaEl = document.getElementById("empty-state-regions-russia");
  const platformEl = document.getElementById("empty-state-platform");
  const demoEl = document.getElementById("empty-state-demo");
  const userTypeEl = document.getElementById("empty-state-usertype");
  const mediaplanFieldGroup = document.querySelector(".mediaplan-field-group");
  const forecastContent = document.getElementById("forecast-content");
  const forecastEmptyMsg = document.getElementById("forecast-empty-message");

  const hasCampaign = !!campaignNameEl?.value?.trim();
  const hasRegions = selectedRegions.size > 0;
  const onlyRussia = hasRegions && selectedRegions.size === 1 && selectedRegions.has(GEO_RUSSIA);
  const ios = platformGroup?.querySelector('[data-platform="ios"]')?.classList.contains("segmented-item--active");
  const android = platformGroup?.querySelector('[data-platform="android"]')?.classList.contains("segmented-item--active");
  const hasPlatform = ios || android;
  const hasBehavior = selectedBehavior.size > 0;
  const agePresetActive = agePresetsContainer?.querySelector(".age-preset--active");
  const hasDemo = !!selectedGender || !!agePresetActive || !!socialMarriage || !!socialKids || selectedChildAges.size > 0 || socialSelfEmployed;
  const hasUserType = !!userType;
  const hasMediaplanImpressions = PLACEMENTS.some((p) => (placementImpressions[p.key] ?? 0) > 0);
  const hasForecastData = hasRegions;

  if (campaignEl) {
    campaignEl.classList.toggle("helper-text--inactive", hasCampaign);
    campaignEl.setAttribute("aria-hidden", String(hasCampaign));
  }
  const geoHelperSlot = document.getElementById("geo-helper-slot");
  if (regionsEl) {
    regionsEl.classList.toggle("helper-text--inactive", hasRegions);
    regionsEl.setAttribute("aria-hidden", String(hasRegions));
  }
  if (regionsRussiaEl) {
    regionsRussiaEl.classList.toggle("helper-text--inactive", !onlyRussia);
    regionsRussiaEl.setAttribute("aria-hidden", String(!onlyRussia));
  }
  if (geoHelperSlot) {
    geoHelperSlot.classList.toggle("geo-helper-slot--collapsed", hasRegions && !onlyRussia);
  }
  if (platformEl) {
    platformEl.classList.toggle("helper-text--inactive", hasPlatform);
    platformEl.setAttribute("aria-hidden", String(hasPlatform));
  }
  if (demoEl) {
    demoEl.classList.toggle("helper-text--inactive", hasDemo);
    demoEl.setAttribute("aria-hidden", String(hasDemo));
  }
  if (userTypeEl) {
    userTypeEl.classList.toggle("helper-text--inactive", true);
    userTypeEl.setAttribute("aria-hidden", "true");
  }
  if (mediaplanFieldGroup) mediaplanFieldGroup.classList.toggle("mediaplan-field-group--empty", !hasMediaplanImpressions);
  if (forecastContent) forecastContent.classList.toggle("forecast-content--inactive", !hasForecastData);
  if (forecastEmptyMsg) forecastEmptyMsg.classList.toggle("forecast-empty-message--inactive", hasForecastData);
}

function handleChange() {
  recalculate();
  syncEmptyStates();
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
const behaviorPeriodGroup = document.getElementById("behavior-period-group");
const behaviorPeriodOther = document.getElementById("behavior-period-other");
const behaviorPeriodWarning = document.getElementById("behavior-period-warning");
const behaviorCategoryCount = document.getElementById("behavior-category-count");
const behaviorEmptyCaption = document.getElementById("behavior-empty-caption");
const forecastUpdatedEl = document.getElementById("forecast-updated");

function syncBehaviorPeriodButtons() {
  document.querySelectorAll(".behavior-period-btn").forEach((btn) => {
    const p = parseInt(btn.dataset.period, 10);
    const active = p === behaviorPeriodDays;
    btn.classList.toggle("behavior-period-btn--active", active);
    btn.setAttribute("aria-checked", String(active));
  });
  if (behaviorPeriodOther) {
    const v = String(behaviorPeriodDays);
    behaviorPeriodOther.value = BEHAVIOR_PERIOD_EXTRA.includes(behaviorPeriodDays) ? v : "";
  }
}

function syncBehaviorPeriodWarning() {
  const show = behaviorPeriodDays === 10 || behaviorPeriodDays === 20;
  behaviorPeriodWarning?.classList.toggle("is-visible", show);
}

function setBehaviorPeriod(days) {
  if (!BEHAVIOR_PERIOD_OPTIONS.includes(days)) return;
  behaviorPeriodDays = days;
  syncBehaviorPeriodButtons();
  syncBehaviorPeriodWarning();
  const forecastContent = document.getElementById("forecast-content");
  const valueEls = forecastContent?.querySelectorAll(".forecast-metric__value, .audience-summary__text");
  valueEls?.forEach((el) => el.style.opacity = "0.5");
  setTimeout(() => {
    handleChange();
    requestAnimationFrame(() => {
      valueEls?.forEach((el) => { el.style.opacity = ""; });
      forecastUpdatedEl?.classList.add("is-visible");
      clearTimeout(forecastUpdatedEl._hideTimeout);
      forecastUpdatedEl._hideTimeout = setTimeout(() => {
        forecastUpdatedEl?.classList.remove("is-visible");
      }, 1500);
    });
  }, 100);
}

behaviorPeriodGroup?.addEventListener("click", (e) => {
  const btn = e.target.closest(".behavior-period-btn");
  if (!btn) return;
  const days = parseInt(btn.dataset.period, 10);
  setBehaviorPeriod(days);
});

behaviorPeriodGroup?.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const btn = e.target.closest(".behavior-period-btn");
  if (!btn) return;
  e.preventDefault();
  const days = parseInt(btn.dataset.period, 10);
  setBehaviorPeriod(days);
});

behaviorPeriodOther?.addEventListener("change", () => {
  const v = behaviorPeriodOther.value;
  if (v) setBehaviorPeriod(parseInt(v, 10));
});

syncBehaviorPeriodButtons();
syncBehaviorPeriodWarning();

function syncBehaviorResetVisibility() {
  const n = selectedBehavior.size;
  if (behaviorResetBtn) behaviorResetBtn.hidden = n === 0;
  if (behaviorCategoryCount) behaviorCategoryCount.textContent = "Выбрано: " + n;
  if (behaviorEmptyCaption) behaviorEmptyCaption.classList.toggle("behavior-empty-caption--hidden", n > 0);
}

function renderBehaviorTiles() {
  if (!behaviorGrid) return;
  behaviorGrid.innerHTML = "";
  BEHAVIOR_CATEGORIES.forEach((label) => {
    const selected = selectedBehavior.has(label);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "behavior-tile" + (selected ? " behavior-tile--selected" : "");
    btn.dataset.behaviorLabel = label;
    btn.setAttribute("role", "checkbox");
    btn.setAttribute("aria-checked", String(selected));
    btn.setAttribute("aria-label", label);
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
  updateTile: (t) => {
    const sel = selectedBehavior.has(t.dataset.behaviorLabel);
    t.classList.toggle("behavior-tile--selected", sel);
    t.setAttribute("aria-checked", String(sel));
  },
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

/** Arrow-key navigation для radio-like групп (пол, семейное положение, дети, тип пользователя) */
function setupArrowKeyNavigation(container, itemSelector) {
  if (!container) return;
  container.addEventListener("keydown", (e) => {
    const items = Array.from(container.querySelectorAll(itemSelector));
    const current = document.activeElement;
    const idx = items.indexOf(current);
    if (idx < 0) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[idx + 1] || items[0];
      next?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[idx - 1] || items[items.length - 1];
      prev?.focus();
    }
  });
}

// Пол
const genderGroup = document.getElementById("gender-group");
if (genderGroup) {
  genderGroup.setAttribute("role", "radiogroup");
  genderGroup.querySelectorAll("[data-gender]").forEach((b) => b.setAttribute("role", "radio"));
  setupArrowKeyNavigation(genderGroup, "[data-gender]");
  genderGroup.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-gender]");
    if (!btn) return;
    const g = btn.dataset.gender;
    selectedGender = selectedGender === g ? null : g;
    genderGroup.querySelectorAll("[data-gender]").forEach((b) => {
      b.classList.toggle("social-tile--selected", b.dataset.gender === selectedGender);
      b.setAttribute("aria-checked", String(b.dataset.gender === selectedGender));
    });
    handleChange();
  });
}

// Социальные характеристики — inline плитки
function isSocialDefault() {
  return (
    !socialMarriage &&
    !socialKids &&
    !socialSelfEmployed &&
    selectedIncome.size === 0 &&
    !userType &&
    selectedBankProducts.size === 0
  );
}

function syncSocialResetVisibility() {
  const resetBtn = document.getElementById("social-reset");
  if (resetBtn) resetBtn.hidden = isSocialDefault();
}

const socialMarriageGroup = document.getElementById("social-marriage");
if (socialMarriageGroup) {
  socialMarriageGroup.setAttribute("role", "radiogroup");
  socialMarriageGroup.querySelectorAll("[data-social-marriage]").forEach((b) => b.setAttribute("role", "radio"));
  setupArrowKeyNavigation(socialMarriageGroup, "[data-social-marriage]");
  socialMarriageGroup.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-social-marriage]");
    if (!btn) return;
    const v = btn.dataset.socialMarriage;
    socialMarriage = socialMarriage === v ? null : v;
    socialMarriageGroup.querySelectorAll("[data-social-marriage]").forEach((b) => {
      b.classList.toggle("social-tile--selected", b.dataset.socialMarriage === socialMarriage);
      b.setAttribute("aria-checked", String(b.dataset.socialMarriage === socialMarriage));
    });
    syncSocialResetVisibility();
    handleChange();
  });
}

const socialKidsGroup = document.getElementById("social-kids");
const childAgeBlock = document.getElementById("child-age-block");
const childAgeGroup = document.getElementById("child-age-group");

function syncChildAgeBlockVisibility() {
  if (!childAgeBlock) return;
  const enabled = socialKids === "yes";
  childAgeBlock.classList.toggle("child-age-block--disabled", !enabled);
  childAgeBlock.setAttribute("aria-disabled", String(!enabled));
  childAgeBlock.inert = !enabled;
  if (!enabled) {
    selectedChildAges.clear();
    childAgeGroup?.querySelectorAll("[data-child-age]").forEach((b) => b.classList.remove("social-tile--selected"));
  }
}

if (socialKidsGroup) {
  socialKidsGroup.setAttribute("role", "radiogroup");
  socialKidsGroup.querySelectorAll("[data-social-kids]").forEach((b) => b.setAttribute("role", "radio"));
  setupArrowKeyNavigation(socialKidsGroup, "[data-social-kids]");
  socialKidsGroup.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-social-kids]");
    if (!btn) return;
    const v = btn.dataset.socialKids;
    socialKids = socialKids === v ? null : v;
    socialKidsGroup.querySelectorAll("[data-social-kids]").forEach((b) => {
      b.classList.toggle("social-tile--selected", b.dataset.socialKids === socialKids);
      b.setAttribute("aria-checked", String(b.dataset.socialKids === socialKids));
    });
    syncChildAgeBlockVisibility();
    syncSocialResetVisibility();
    handleChange();
  });
}

if (childAgeGroup) {
  setupDragSelection({
    container: childAgeGroup,
    tileSelector: "[data-child-age]",
    getValue: (t) => t.dataset.childAge,
    isSelected: (t) => selectedChildAges.has(t.dataset.childAge),
    setSelected: (v, on) => {
      if (on) selectedChildAges.add(v);
      else selectedChildAges.delete(v);
    },
    updateTile: (t) => t.classList.toggle("social-tile--selected", selectedChildAges.has(t.dataset.childAge)),
    onChanged: () => {
      syncSocialResetVisibility();
      handleChange();
    },
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

const userTypeGroup = document.getElementById("user-type-group");
if (userTypeGroup) {
  userTypeGroup.setAttribute("role", "radiogroup");
  userTypeGroup.querySelectorAll("[data-user-type]").forEach((b) => b.setAttribute("role", "radio"));
  setupArrowKeyNavigation(userTypeGroup, "[data-user-type]");
  userTypeGroup.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-user-type]");
    if (!btn) return;
    const v = btn.dataset.userType;
    userType = userType === v ? null : v;
    userTypeGroup.querySelectorAll("[data-user-type]").forEach((b) => {
      b.classList.toggle("social-tile--selected", b.dataset.userType === userType);
      b.setAttribute("aria-checked", String(b.dataset.userType === userType));
    });
    syncSocialResetVisibility();
    handleChange();
  });
}

const bankProductsGroup = document.getElementById("bank-products-group");
const bankProductsResetBtn = document.getElementById("bank-products-reset");

function syncBankProductsResetVisibility() {
  if (bankProductsResetBtn) bankProductsResetBtn.hidden = selectedBankProducts.size === 0;
}

function renderBankProductsTiles() {
  if (!bankProductsGroup) return;
  bankProductsGroup.innerHTML = "";
  BANK_PRODUCT_GROUPS.forEach(({ label: groupLabel, products }) => {
    const category = document.createElement("div");
    category.className = "bank-products-category";
    const heading = document.createElement("div");
    heading.className = "bank-products-category-label";
    heading.textContent = groupLabel;
    category.appendChild(heading);
    const tilesWrap = document.createElement("div");
    tilesWrap.className = "bank-products-category-tiles";
    products.forEach(({ key, label }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "social-tile bank-product-tile" + (selectedBankProducts.has(key) ? " social-tile--selected" : "");
      btn.dataset.bankProduct = key;
      btn.innerHTML = `<span class="bank-product-tile__text">${escapeHtml(label)}</span>`;
      tilesWrap.appendChild(btn);
    });
    category.appendChild(tilesWrap);
    bankProductsGroup.appendChild(category);
  });
  syncBankProductsResetVisibility();
}

renderBankProductsTiles();

if (bankProductsGroup) {
  setupDragSelection({
    container: bankProductsGroup,
    tileSelector: "[data-bank-product]",
    getValue: (t) => t.dataset.bankProduct,
    isSelected: (t) => selectedBankProducts.has(t.dataset.bankProduct),
    setSelected: (v, on) => {
      if (on) selectedBankProducts.add(v);
      else selectedBankProducts.delete(v);
    },
    updateTile: (t) => t.classList.toggle("social-tile--selected", selectedBankProducts.has(t.dataset.bankProduct)),
    onChanged: () => {
      syncBankProductsResetVisibility();
      syncSocialResetVisibility();
      handleChange();
    },
  });
}

bankProductsResetBtn?.addEventListener("click", () => {
  selectedBankProducts.clear();
  bankProductsGroup?.querySelectorAll("[data-bank-product]").forEach((b) => b.classList.remove("social-tile--selected"));
  syncBankProductsResetVisibility();
  syncSocialResetVisibility();
  handleChange();
});

const socialResetBtn = document.getElementById("social-reset");
socialResetBtn?.addEventListener("click", () => {
  socialMarriage = null;
  socialKids = null;
  selectedChildAges.clear();
  socialSelfEmployed = false;
  selectedIncome.clear();
  userType = null;
  selectedBankProducts.clear();
  socialMarriageGroup?.querySelectorAll("[data-social-marriage]").forEach((b) => b.classList.remove("social-tile--selected"));
  socialKidsGroup?.querySelectorAll("[data-social-kids]").forEach((b) => b.classList.remove("social-tile--selected"));
  childAgeBlock?.querySelectorAll("[data-child-age]").forEach((b) => b.classList.remove("social-tile--selected"));
  syncChildAgeBlockVisibility();
  socialSelfEmployedBtn?.classList.remove("social-tile--selected");
  socialIncomeGroup?.querySelectorAll("[data-social-income]").forEach((b) => b.classList.remove("social-tile--selected"));
  userTypeGroup?.querySelectorAll("[data-user-type]").forEach((b) => b.classList.remove("social-tile--selected"));
  bankProductsGroup?.querySelectorAll("[data-bank-product]").forEach((b) => b.classList.remove("social-tile--selected"));
  syncBankProductsResetVisibility();
  syncSocialResetVisibility();
  handleChange();
});

document.addEventListener("click", (e) => {
  if (!geoDropdown?.hidden) {
    if (!geoSearchInput?.contains(e.target) && !geoDropdown?.contains(e.target)) closeGeoDropdown();
  }
});

// Подготовка медиаплана
function formatRubles(n) {
  return Math.round(n).toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";
}

function formatImpressions(n) {
  return Math.round(n).toLocaleString("ru-RU", { maximumFractionDigits: 0 });
}

function formatCr(decimal) {
  const pct = decimal * 100;
  const s = pct % 1 === 0
    ? pct.toLocaleString("ru-RU", { maximumFractionDigits: 0 })
    : pct.toLocaleString("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  return s + " %";
}

function parseImpressionsFromInput(val) {
  return parseInt(String(val).replace(/\D/g, ""), 10) || 0;
}

function parseBudgetFromInput(val) {
  return parseInt(String(val).replace(/\D/g, ""), 10) || 0;
}

const BUDGET_ROUND = 10000;

const mediaplanTbody = document.getElementById("mediaplan-tbody");
const mediaplanBudgetInput = document.getElementById("mediaplan-budget-input");
const mediaplanBudgetCheck = document.getElementById("mediaplan-budget-check");
const mediaplanDistributeByImpressionsBtn = document.getElementById("mediaplan-distribute-by-impressions-btn");
const mediaplanDistributeByCostBtn = document.getElementById("mediaplan-distribute-by-cost-btn");

const MEDIAPLAN_PRESETS = [50000, 100000, 200000];

function renderMediaPlanTable() {
  if (!mediaplanTbody) return;
  mediaplanTbody.innerHTML = "";
  PLACEMENTS.forEach((p) => {
    const selected = selectedPlacements.has(p.key);
    const impressions = placementImpressions[p.key] ?? 0;
    const cost = (impressions / 1000) * p.cpm;
    const clicks = Math.round(impressions * p.conversion);
    const desc = p.desc ? escapeHtml(p.desc) : "";
    const tr = document.createElement("tr");
    tr.className = "mediaplan-row" + (selected ? " mediaplan-row--selected" : "");
    tr.dataset.placementKey = p.key;
    const impressionsDisplay = selected && impressions > 0 ? formatImpressions(impressions) : "—";
    const clicksDisplay = selected && impressions > 0 ? formatImpressions(clicks) : "—";
    const costDisplay = selected && impressions > 0 ? formatRubles(cost) : "—";
    const autoFromBudget = selected && placementAutoFromBudget.has(p.key);

    tr.innerHTML = `
      <td class="mediaplan-td mediaplan-td-name">
        <label class="mediaplan-placement-label-wrap">
          <span class="mediaplan-placement-check" role="checkbox" tabindex="0" aria-checked="${selected}" data-placement-key="${p.key}" aria-label="Выбрать ${escapeHtml(p.label)}"></span>
          <span class="mediaplan-placement-content">
            <span class="mediaplan-placement-name">${escapeHtml(p.label)}</span>
            ${desc ? `<span class="mediaplan-placement-desc">${desc}</span>` : ""}
          </span>
        </label>
      </td>
      <td class="mediaplan-td mediaplan-td-impressions mediaplan-td-impressions--value" data-placement-key="${p.key}">
        ${selected
          ? `<span class="mediaplan-impressions-value-wrap"><span class="mediaplan-impressions-value">${impressionsDisplay}</span>${autoFromBudget ? '<span class="mediaplan-auto-badge">Авто из бюджета</span>' : ""}</span>`
          : `<span class="mediaplan-impressions-hint">Выберите плейсмент, чтобы указать показы</span>`
        }
      </td>
      <td class="mediaplan-td mediaplan-td-cpm"><span class="mediaplan-cpm-value">${formatRubles(p.cpm)}</span></td>
      <td class="mediaplan-td mediaplan-td-cr"><span class="mediaplan-cr-value">${formatCr(p.conversion)}</span></td>
      <td class="mediaplan-td mediaplan-td-clicks"><span class="mediaplan-clicks-value">${clicksDisplay}</span></td>
      <td class="mediaplan-td mediaplan-td-cost"><span class="mediaplan-cost-value">${costDisplay}</span></td>
    `;
    mediaplanTbody.appendChild(tr);

    const subTr = document.createElement("tr");
    subTr.className = "mediaplan-sub-row" + (selected ? " mediaplan-sub-row--visible" : "");
    subTr.dataset.placementKey = p.key;
    subTr.innerHTML = `
      <td colspan="6" class="mediaplan-sub-cell">
        <div class="mediaplan-sub-inner">
          <span class="mediaplan-sub-label">Задать показы</span>
          <input type="text" inputmode="numeric" class="mediaplan-impressions-input" data-placement-key="${p.key}"
            value="${impressions > 0 ? formatImpressions(impressions) : ""}"
            aria-label="Задать показы для ${escapeHtml(p.label)}"
            ${selected ? "" : "disabled"} />
          <div class="mediaplan-presets">
            ${MEDIAPLAN_PRESETS.map((v) => `<button type="button" class="mediaplan-preset-btn" data-placement-key="${p.key}" data-value="${v}">${formatImpressions(v)}</button>`).join("")}
          </div>
        </div>
      </td>
    `;
    mediaplanTbody.appendChild(subTr);
  });
}

function syncMediaPlanTotals() {
  let totalImpressions = 0;
  let totalCost = 0;
  let totalClicks = 0;
  PLACEMENTS.forEach((p) => {
    if (!selectedPlacements.has(p.key)) return;
    const imp = placementImpressions[p.key] ?? 0;
    totalImpressions += imp;
    totalCost += (imp / 1000) * p.cpm;
    totalClicks += imp * p.conversion;
  });
  const avgCpm = totalImpressions > 0 ? totalCost / (totalImpressions / 1000) : null;
  const avgCr = totalImpressions > 0 ? totalClicks / totalImpressions : null;
  const copyText = totalImpressions > 0 || totalCost > 0
    ? [
        "Итого показы: " + formatImpressions(totalImpressions),
        "Средний CPM: " + (avgCpm != null ? formatRubles(avgCpm) : "—"),
        "Итого клики: " + formatImpressions(Math.round(totalClicks)),
        "Средний CR: " + (avgCr != null ? formatCr(avgCr) : "—"),
        "Общий бюджет: " + formatRubles(totalCost),
      ].join(" · ")
    : "—";
  const textEl = document.getElementById("mediaplan-totals-text");
  if (textEl) textEl.textContent = copyText;
  syncBudgetCheck();
  syncBudgetDistributeButton();
}

function getMediaPlanTotalCost() {
  let total = 0;
  PLACEMENTS.forEach((p) => {
    if (!selectedPlacements.has(p.key)) return;
    const imp = placementImpressions[p.key] ?? 0;
    total += (imp / 1000) * p.cpm;
  });
  return total;
}

function syncBudgetCheck() {
  if (!mediaplanBudgetCheck) return;
  const budget = campaignBudget;
  if (budget == null || budget <= 0) {
    mediaplanBudgetCheck.hidden = true;
    mediaplanBudgetCheck.textContent = "";
    return;
  }
  const totalCost = getMediaPlanTotalCost();
  const selectedWithImpressions = PLACEMENTS.filter((p) => selectedPlacements.has(p.key) && (placementImpressions[p.key] ?? 0) > 0).length;
  if (selectedWithImpressions === 0) {
    mediaplanBudgetCheck.hidden = true;
    mediaplanBudgetCheck.textContent = "";
    return;
  }
  mediaplanBudgetCheck.hidden = false;
  const diff = totalCost - budget;
  if (Math.abs(diff) <= 50000) {
    mediaplanBudgetCheck.textContent = "Проверка: бюджет соблюдён";
    mediaplanBudgetCheck.className = "mediaplan-budget-check mediaplan-budget-check--ok";
  } else if (diff > 50000) {
    mediaplanBudgetCheck.textContent = "Проверка: превышение бюджета на " + formatRubles(diff);
    mediaplanBudgetCheck.className = "mediaplan-budget-check mediaplan-budget-check--info";
  } else {
    mediaplanBudgetCheck.textContent = "Проверка: недоиспользование бюджета на " + formatRubles(-diff);
    mediaplanBudgetCheck.className = "mediaplan-budget-check mediaplan-budget-check--info";
  }
}

function syncBudgetDistributeButton() {
  const hasBudget = campaignBudget != null && campaignBudget > 0;
  if (mediaplanDistributeByImpressionsBtn) mediaplanDistributeByImpressionsBtn.disabled = !hasBudget;
  if (mediaplanDistributeByCostBtn) mediaplanDistributeByCostBtn.disabled = !hasBudget;
}

function distributeByImpressions() {
  const budget = campaignBudget;
  if (budget == null || budget <= 0) return;
  const keys = [...selectedPlacements];
  if (keys.length === 0) return;
  const placements = keys.map((k) => PLACEMENTS.find((x) => x.key === k)).filter(Boolean);
  const sumCpm = placements.reduce((s, p) => s + p.cpm, 0);
  if (sumCpm <= 0) return;
  const imp = Math.round((budget * 1000) / sumCpm);
  keys.forEach((key) => {
    placementImpressions[key] = Math.max(0, imp);
    placementAutoFromBudget.add(key);
  });
  renderMediaPlanTable();
  syncMediaPlanTotals();
  rebindMediaPlanInputs();
}

function distributeByCost() {
  const budget = campaignBudget;
  if (budget == null || budget <= 0) return;
  const keys = [...selectedPlacements];
  if (keys.length === 0) return;
  const perPlacementRounded = Math.round((budget / keys.length) / 50000) * 50000;
  keys.forEach((key) => {
    const p = PLACEMENTS.find((x) => x.key === key);
    if (!p || p.cpm <= 0) return;
    const impressions = Math.round((perPlacementRounded / p.cpm) * 1000);
    placementImpressions[key] = Math.max(0, impressions);
    placementAutoFromBudget.add(key);
  });
  renderMediaPlanTable();
  syncMediaPlanTotals();
  rebindMediaPlanInputs();
}

function togglePlacement(key) {
  if (selectedPlacements.has(key)) {
    selectedPlacements.delete(key);
  } else {
    selectedPlacements.add(key);
    if (placementImpressions[key] == null) placementImpressions[key] = 0;
  }
  renderMediaPlanTable();
  syncMediaPlanTotals();
  rebindMediaPlanInputs();
}

mediaplanTbody?.addEventListener("click", (e) => {
  if (e.target.closest("input.mediaplan-impressions-input")) return;
  const presetBtn = e.target.closest(".mediaplan-preset-btn");
  if (presetBtn) {
    const key = presetBtn.dataset.placementKey;
    const val = parseInt(presetBtn.dataset.value, 10);
    if (key && selectedPlacements.has(key)) {
      placementAutoFromBudget.delete(key);
      placementImpressions[key] = val;
      renderMediaPlanTable();
      syncMediaPlanTotals();
      rebindMediaPlanInputs();
    }
    return;
  }
  const row = e.target.closest(".mediaplan-row");
  const labelWrap = e.target.closest(".mediaplan-placement-label-wrap");
  const check = e.target.closest(".mediaplan-placement-check");
  const tdName = e.target.closest(".mediaplan-td-name");
  const key = row?.dataset?.placementKey ?? check?.dataset?.placementKey;
  if (!key || (!labelWrap && !check && !tdName)) return;
  togglePlacement(key);
});

mediaplanTbody?.addEventListener("keydown", (e) => {
  if (e.target.closest("input.mediaplan-impressions-input")) {
    if (e.key === "Enter") e.preventDefault();
    return;
  }
  const check = e.target.closest(".mediaplan-placement-check");
  if (check && e.key === " ") {
    e.preventDefault();
    const key = check.dataset.placementKey;
    if (key) togglePlacement(key);
  }
});

function rebindMediaPlanInputs() {
  mediaplanTbody?.querySelectorAll(".mediaplan-impressions-input").forEach((inp) => {
    inp.removeEventListener("input", handleMediaPlanImpressionsInput);
    inp.removeEventListener("blur", handleMediaPlanImpressionsBlur);
    inp.removeEventListener("focus", handleMediaPlanImpressionsFocus);
    inp.addEventListener("input", handleMediaPlanImpressionsInput);
    inp.addEventListener("blur", handleMediaPlanImpressionsBlur);
    inp.addEventListener("focus", handleMediaPlanImpressionsFocus);
  });
}

function handleMediaPlanImpressionsFocus(e) {
  const key = e.target.dataset.placementKey;
  mediaplanTbody?.querySelectorAll(".mediaplan-td-impressions--value").forEach((td) => {
    td.classList.toggle("mediaplan-td-impressions--focused", td.dataset.placementKey === key);
  });
}

function handleMediaPlanImpressionsInput(e) {
  const inp = e.target;
  const key = inp.dataset.placementKey;
  placementAutoFromBudget.delete(key);
  const mainRow = inp.closest(".mediaplan-sub-row")?.previousElementSibling;
  mainRow?.querySelector(".mediaplan-auto-badge")?.remove();
  const val = parseImpressionsFromInput(inp.value);
  placementImpressions[key] = val >= 0 ? val : 0;
  const imp = placementImpressions[key] ?? 0;
  const formatted = imp > 0 ? formatImpressions(imp) : "";
  inp.value = formatted;
  inp.setSelectionRange(formatted.length, formatted.length);
  const p = PLACEMENTS.find((x) => x.key === key);
  if (p) {
    const cost = (imp / 1000) * p.cpm;
    const clicks = Math.round(imp * p.conversion);
    const subRow = inp.closest(".mediaplan-sub-row");
    const mainRow = subRow?.previousElementSibling;
    if (mainRow?.classList.contains("mediaplan-row")) {
      const impressionsSpan = mainRow.querySelector(".mediaplan-impressions-value");
      const costCell = mainRow.querySelector(".mediaplan-cost-value");
      const clicksCell = mainRow.querySelector(".mediaplan-clicks-value");
      if (impressionsSpan) {
        impressionsSpan.textContent = imp > 0 ? formatImpressions(imp) : "—";
        impressionsSpan.classList.remove("mediaplan-impressions-value--updated");
        impressionsSpan.offsetWidth;
        impressionsSpan.classList.add("mediaplan-impressions-value--updated");
        clearTimeout(impressionsSpan._animTimeout);
        impressionsSpan._animTimeout = setTimeout(() => impressionsSpan.classList.remove("mediaplan-impressions-value--updated"), 400);
      }
      if (costCell) costCell.textContent = imp > 0 ? formatRubles(cost) : "—";
      if (clicksCell) clicksCell.textContent = imp > 0 ? formatImpressions(clicks) : "—";
    }
  }
  syncMediaPlanTotals();
  syncEmptyStates();
}

function handleMediaPlanImpressionsBlur(e) {
  const inp = e.target;
  const key = inp.dataset.placementKey;
  const val = placementImpressions[key] ?? 0;
  inp.value = val > 0 ? formatImpressions(val) : "";
  mediaplanTbody?.querySelector(`.mediaplan-td-impressions[data-placement-key="${key}"]`)?.classList.remove("mediaplan-td-impressions--focused");
}

function getMediaPlanData() {
  const placements = [];
  PLACEMENTS.forEach((p) => {
    if (selectedPlacements.has(p.key)) {
      placements.push({ key: p.key, impressions: placementImpressions[p.key] ?? 0 });
    }
  });
  let totalImpressions = 0;
  let totalCost = 0;
  placements.forEach(({ key, impressions }) => {
    const p = PLACEMENTS.find((x) => x.key === key);
    if (p) {
      totalImpressions += impressions;
      totalCost += (impressions / 1000) * p.cpm;
    }
  });
  const avgCPM = totalImpressions > 0 ? totalCost / (totalImpressions / 1000) : null;
  return { placements, totalImpressions, totalCost, avgCPM, budget: campaignBudget };
}

function setMediaPlanData(data) {
  if (!data || !data.placements) return;
  selectedPlacements.clear();
  placementAutoFromBudget.clear();
  PLACEMENTS.forEach((p) => {
    placementImpressions[p.key] = 0;
  });
  data.placements.forEach(({ key, impressions }) => {
    if (PLACEMENTS.some((x) => x.key === key)) {
      selectedPlacements.add(key);
      placementImpressions[key] = Number.isFinite(impressions) && impressions >= 0 ? impressions : 0;
    }
  });
  campaignBudget = data.budget != null && Number.isFinite(data.budget) && data.budget >= 0 ? data.budget : null;
  if (mediaplanBudgetInput) {
    mediaplanBudgetInput.value = campaignBudget != null && campaignBudget > 0 ? formatImpressions(campaignBudget) : "";
  }
  renderMediaPlanTable();
  syncMediaPlanTotals();
  rebindMediaPlanInputs();
  syncBudgetCheck();
  syncBudgetDistributeButton();
}

const SAVED_CALC_KEY = "audience-calc-saved";

function saveCalculation() {
  const mediaPlan = getMediaPlanData();
  const payload = { mediaPlan };
  try {
    localStorage.setItem(SAVED_CALC_KEY, JSON.stringify(payload));
  } catch (_) {}
}

function loadCalculation() {
  try {
    const raw = localStorage.getItem(SAVED_CALC_KEY);
    if (!raw) return;
    const payload = JSON.parse(raw);
    if (payload.mediaPlan) setMediaPlanData(payload.mediaPlan);
  } catch (_) {}
}

function hasSavedCalculation() {
  try {
    return !!localStorage.getItem(SAVED_CALC_KEY);
  } catch (_) {
    return false;
  }
}

const mediaplanSaveBtn = document.getElementById("mediaplan-save-btn");

mediaplanSaveBtn?.addEventListener("click", () => {
  saveCalculation();
  mediaplanSaveBtn?.classList.add("mediaplan-save-btn--saved");
  clearTimeout(mediaplanSaveBtn._savedTimeout);
  mediaplanSaveBtn._savedTimeout = setTimeout(() => {
    mediaplanSaveBtn?.classList.remove("mediaplan-save-btn--saved");
  }, 450);
});

const campaignNameInput = document.getElementById("campaign-name");
campaignNameInput?.addEventListener("input", syncEmptyStates);

mediaplanBudgetInput?.addEventListener("input", () => {
  const raw = parseBudgetFromInput(mediaplanBudgetInput.value);
  campaignBudget = raw > 0 ? raw : null;
  syncBudgetDistributeButton();
  syncBudgetCheck();
});

mediaplanBudgetInput?.addEventListener("blur", () => {
  const raw = parseBudgetFromInput(mediaplanBudgetInput.value);
  if (raw <= 0) {
    campaignBudget = null;
    mediaplanBudgetInput.value = "";
  } else {
    campaignBudget = Math.round(raw / BUDGET_ROUND) * BUDGET_ROUND;
    mediaplanBudgetInput.value = formatImpressions(campaignBudget);
  }
  syncBudgetCheck();
  syncBudgetDistributeButton();
});

mediaplanBudgetInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") e.preventDefault();
});

mediaplanDistributeByImpressionsBtn?.addEventListener("click", () => {
  distributeByImpressions();
});

mediaplanDistributeByCostBtn?.addEventListener("click", () => {
  distributeByCost();
});

loadCalculation();
renderMediaPlanTable();
rebindMediaPlanInputs();
syncBudgetCheck();
syncBudgetDistributeButton();

syncDateDuration();
recalculate();
syncEmptyStates();
syncChildAgeBlockVisibility();
