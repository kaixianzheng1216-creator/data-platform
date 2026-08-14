const views = [...document.querySelectorAll(".view")];
const navItems = [...document.querySelectorAll(".nav-item")];
const pageLabel = document.querySelector("#page-label");
const labels = {
  overview: "总览",
  skills: "Skill 与数据能力",
  reference: "Reference 知识库",
  koc: "KOC 达人库",
  trends: "品牌与趋势洞察",
  apis: "接口目录",
};

function showView(name) {
  views.forEach((view) => view.classList.toggle("active", view.id === `${name}-view`));
  navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === name));
  pageLabel.textContent = labels[name];
  document.querySelector(".sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navItems.forEach((item) => item.addEventListener("click", () => showView(item.dataset.view)));
document.querySelectorAll("[data-view-link]").forEach((item) => item.addEventListener("click", () => showView(item.dataset.viewLink)));
document.querySelector(".mobile-menu").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));

const toast = document.querySelector("#toast");
let toastTimer;
function showToast(message = "操作已完成") {
  toast.querySelector("p").textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function escapeHtml(value) {
  const node = document.createElement("div");
  node.textContent = value;
  return node.innerHTML;
}

// 通用弹窗
const formModal = document.querySelector("#form-modal");
const entityForm = document.querySelector("#entity-form");
const detailModal = document.querySelector("#detail-modal");

function openBackdrop(backdrop) {
  backdrop.classList.add("open");
  backdrop.setAttribute("aria-hidden", "false");
}

function closeBackdrop(backdrop) {
  backdrop.classList.remove("open");
  backdrop.setAttribute("aria-hidden", "true");
}

function openEntityForm(type) {
  entityForm.dataset.type = type;
  const fields = document.querySelector("#form-fields");
  if (type === "skill") {
    document.querySelector("#form-eyebrow").textContent = "CREATE SKILL";
    document.querySelector("#form-title").textContent = "新建 Skill";
    document.querySelector("#form-copy").textContent = "登记 Skill 身份，创建后再绑定数据能力。";
    document.querySelector("#form-submit").textContent = "创建 Skill";
    fields.innerHTML = `<div class="form-stack">
      <label>Skill 名称<input name="name" required placeholder="例如：小红书标题优化" /></label>
      <label>skill_key<input name="key" required pattern="[a-z0-9_]+" placeholder="xiaohongshu_title" /></label>
      <label>一句话说明<textarea name="description" required placeholder="说明这个 Skill 解决什么问题"></textarea></label>
    </div>`;
  } else {
    document.querySelector("#form-eyebrow").textContent = "CREATE FOLDER";
    document.querySelector("#form-title").textContent = "新建目录";
    document.querySelector("#form-copy").textContent = "目录仅用于运营整理，不影响 Skill 检索。";
    document.querySelector("#form-submit").textContent = "创建目录";
    fields.innerHTML = `<div class="form-stack">
      <label>目录名称<input name="name" required placeholder="例如：标题与选题" /></label>
      <label>Reference 分组<select name="parent"><option>小红书选题助手</option><option>KOC 投放筛号</option><option>抖音热点雷达</option><option>品牌命名顾问</option></select></label>
    </div>`;
  }
  openBackdrop(formModal);
  setTimeout(() => fields.querySelector("input")?.focus(), 100);
}

function openDetail({ eyebrow = "DETAIL", title, content }) {
  document.querySelector("#detail-eyebrow").textContent = eyebrow;
  document.querySelector("#detail-title").textContent = title;
  document.querySelector("#detail-content").innerHTML = content;
  openBackdrop(detailModal);
}

document.querySelector('[data-action="create-skill"]').addEventListener("click", () => openEntityForm("skill"));
document.querySelector('[data-action="create-folder"]').addEventListener("click", () => openEntityForm("folder"));

entityForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(entityForm);
  if (entityForm.dataset.type === "skill") {
    addSkillCard(data.get("name"), data.get("key"), data.get("description"));
    closeBackdrop(formModal);
    showView("skills");
    showToast("Skill 已创建，可继续绑定数据能力");
  } else {
    addFolder(String(data.get("name")));
    closeBackdrop(formModal);
    showToast("目录已创建");
  }
  entityForm.reset();
});

[formModal, detailModal].forEach((backdrop) => {
  backdrop.addEventListener("click", (event) => { if (event.target === backdrop) closeBackdrop(backdrop); });
  backdrop.querySelector(".modal-close").addEventListener("click", () => closeBackdrop(backdrop));
});
formModal.querySelector(".modal-cancel").addEventListener("click", () => closeBackdrop(formModal));
detailModal.querySelector(".detail-close").addEventListener("click", () => closeBackdrop(detailModal));

// 文件上传 Mock
const uploadModal = document.querySelector("#upload-modal");
const mockFile = document.querySelector("#mock-file");
let uploadType = "reference";

function openUpload(type = "reference") {
  uploadType = type;
  const isKoc = type === "koc";
  document.querySelector("#modal-title").textContent = isKoc ? "导入 KOC 达人表" : "上传 Reference 文档";
  document.querySelector("#modal-copy").textContent = isKoc ? "系统将校验表头和每行数据，并形成可筛选的达人记录。" : "上传后由系统异步解析并建立检索索引。";
  document.querySelector("#drop-title").textContent = isKoc ? "拖入 Excel 或 CSV 文件" : "拖入 PDF、Word 或 Markdown";
  document.querySelector("#file-hint").textContent = isKoc ? "或点击选择文件 · 使用标准达人模板" : "或点击选择文件 · 单个文件不超过 50 MB";
  const target = document.querySelector("#upload-target");
  document.querySelector("#upload-target-field").hidden = isKoc;
  if (!isKoc) target.innerHTML = "<option>小红书选题助手</option><option>KOC 投放筛号</option><option>抖音热点雷达</option><option>品牌命名顾问</option>";
  mockFile.value = "";
  document.querySelector(".drop-zone").classList.remove("has-file");
  openBackdrop(uploadModal);
}

function closeUpload() { closeBackdrop(uploadModal); }
document.querySelector('[data-action="upload-reference"]').addEventListener("click", () => openUpload("reference"));
document.querySelector('[data-action="upload-koc"]').addEventListener("click", () => openUpload("koc"));
uploadModal.querySelector(".modal-close").addEventListener("click", closeUpload);
uploadModal.querySelector(".modal-cancel").addEventListener("click", closeUpload);
uploadModal.addEventListener("click", (event) => { if (event.target === uploadModal) closeUpload(); });
mockFile.addEventListener("change", () => {
  if (!mockFile.files.length) return;
  document.querySelector("#drop-title").textContent = mockFile.files[0].name;
  document.querySelector("#file-hint").textContent = `${(mockFile.files[0].size / 1024).toFixed(1)} KB · 已选择`;
  document.querySelector(".drop-zone").classList.add("has-file");
});
document.querySelector("#confirm-upload").addEventListener("click", () => {
  const filename = mockFile.files[0]?.name || (uploadType === "koc" ? "KOC达人导入示例.xlsx" : "新上传运营文档.pdf");
  closeUpload();
  if (uploadType === "reference") {
    addDocument(filename);
    showView("reference");
    showToast("文档已上传，正在解析和索引");
  } else {
    const total = Number(document.querySelector("#koc-total").textContent.replace(",", "")) + 128;
    document.querySelector("#koc-total").textContent = total.toLocaleString("zh-CN");
    showView("koc");
    showToast("达人表已加入导入队列");
  }
});

// Skill 列表、筛选与绑定
let skillFilter = "all";
let currentSkillCard = null;

function bindSkillCard(card) {
  card.querySelector('[data-open-drawer="skill"]').addEventListener("click", () => openSkillDrawer(card));
}
document.querySelectorAll(".skill-card").forEach(bindSkillCard);

function addSkillCard(name, key, description) {
  const list = document.querySelector('[data-list="skills"]');
  const index = list.querySelectorAll(".skill-card").length + 1;
  const card = document.createElement("article");
  card.className = "skill-card searchable muted-card";
  card.dataset.bound = "false";
  card.dataset.refBindings = "";
  card.dataset.insightBindings = "";
  card.innerHTML = `<div class="skill-index">${String(index).padStart(2, "0")}</div><h3>${escapeHtml(String(name))}</h3><code>${escapeHtml(String(key))}</code><p>${escapeHtml(String(description))}</p><div class="binding"><span>Reference <b data-ref-count>0</b></span><span>KOC <b data-koc-state>—</b></span><span>洞察 <b data-insight-count>0</b></span></div><button class="card-link" data-open-drawer="skill">绑定数据能力 →</button>`;
  list.appendChild(card);
  bindSkillCard(card);
  applySkillFilters();
}

function applySkillFilters() {
  const query = document.querySelector('[data-search="skills"]').value.trim().toLowerCase();
  document.querySelectorAll(".skill-card").forEach((card) => {
    const matchesSearch = card.textContent.toLowerCase().includes(query);
    const matchesFilter = skillFilter === "all" || (skillFilter === "bound") === (card.dataset.bound === "true");
    card.classList.toggle("filtered-out", !matchesSearch || !matchesFilter);
  });
}
document.querySelector('[data-search="skills"]').addEventListener("input", applySkillFilters);
document.querySelectorAll("[data-skill-filter]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-skill-filter]").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  skillFilter = button.dataset.skillFilter;
  applySkillFilters();
}));

const skillDrawer = document.querySelector("#skill-drawer");
function syncSkillBoundState(card) {
  const refCount = Number(card.querySelector("[data-ref-count]").textContent);
  const hasKoc = card.querySelector("[data-koc-state]").textContent.trim() === "✓";
  const insightCount = Number(card.querySelector("[data-insight-count]").textContent);
  card.dataset.bound = String(refCount > 0 || hasKoc || insightCount > 0);
  card.classList.toggle("muted-card", card.dataset.bound === "false");
  card.querySelector(".card-link").textContent = card.dataset.bound === "true" ? "管理数据能力 →" : "绑定数据能力 →";
}

function updateInsightBoundCount() {
  const count = [...document.querySelectorAll(".skill-card")]
    .filter((card) => Number(card.querySelector("[data-insight-count]").textContent) > 0).length;
  document.querySelector("#trend-bound-count").textContent = count;
}

function openSkillDrawer(card) {
  currentSkillCard = card;
  document.querySelector("#drawer-skill-name").textContent = card.querySelector("h3").textContent;
  document.querySelector("#drawer-skill-key").textContent = card.querySelector("code").textContent;
  const referenceBindings = new Set((card.dataset.refBindings || "").split(",").filter(Boolean).map(Number));
  const insightBindings = new Set((card.dataset.insightBindings || "").split(",").filter(Boolean));
  document.querySelectorAll('[data-binding="reference"]').forEach((input, index) => { input.checked = referenceBindings.has(index); });
  document.querySelector("#koc-binding").checked = card.querySelector("[data-koc-state]").textContent.trim() === "✓";
  document.querySelectorAll('[data-binding="insight"]').forEach((input) => { input.checked = insightBindings.has(input.value); });
  skillDrawer.classList.add("open");
  skillDrawer.setAttribute("aria-hidden", "false");
}
function closeSkillDrawer() { skillDrawer.classList.remove("open"); skillDrawer.setAttribute("aria-hidden", "true"); }
document.querySelectorAll(".drawer-close").forEach((button) => button.addEventListener("click", closeSkillDrawer));
document.querySelectorAll("[data-select-all]").forEach((button) => button.addEventListener("click", () => {
  const inputs = [...document.querySelectorAll(`[data-binding="${button.dataset.selectAll}"]`)];
  const shouldCheck = inputs.some((input) => !input.checked);
  inputs.forEach((input) => { input.checked = shouldCheck; });
  button.textContent = shouldCheck ? "取消全选" : "全选";
}));
document.querySelector("#save-binding").addEventListener("click", () => {
  if (!currentSkillCard) return;
  const refCount = document.querySelectorAll('[data-binding="reference"]:checked').length;
  const hasKoc = document.querySelector("#koc-binding").checked;
  const insightBindings = [...document.querySelectorAll('[data-binding="insight"]:checked')].map((input) => input.value);
  currentSkillCard.querySelector("[data-ref-count]").textContent = refCount;
  currentSkillCard.dataset.refBindings = [...document.querySelectorAll('[data-binding="reference"]')]
    .flatMap((input, index) => input.checked ? [index] : []).join(",");
  currentSkillCard.querySelector("[data-koc-state]").textContent = hasKoc ? "✓" : "—";
  currentSkillCard.dataset.insightBindings = insightBindings.join(",");
  currentSkillCard.querySelector("[data-insight-count]").textContent = insightBindings.length;
  syncSkillBoundState(currentSkillCard);
  updateInsightBoundCount();
  closeSkillDrawer();
  applySkillFilters();
  showToast("数据能力绑定已保存");
});

document.querySelector('[data-action="manage-trend-binding"]').addEventListener("click", () => {
  showView("skills");
  showToast("请在具体 Skill 中配置洞察能力");
});

// Reference 目录、文档筛选与状态
let activeFolder = "all";
const documentBody = document.querySelector('[data-list="documents"]');

function bindFolder(button) {
  button.addEventListener("click", () => {
    document.querySelectorAll(".folder").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeFolder = button.dataset.folder;
    applyDocumentFilters();
  });
}
document.querySelectorAll(".folder").forEach(bindFolder);

function addFolder(name) {
  const button = document.createElement("button");
  button.className = "folder";
  button.dataset.folder = name;
  button.innerHTML = `<span>⌑</span>${escapeHtml(name)} <b>0</b>`;
  document.querySelector(".new-folder").before(button);
  bindFolder(button);
  button.click();
}

function addDocument(filename) {
  const row = document.createElement("tr");
  row.className = "searchable";
  row.dataset.folder = activeFolder === "all" ? "小红书选题助手" : activeFolder;
  row.dataset.status = "processing";
  row.dataset.order = String(Date.now());
  row.innerHTML = `<td><div class="file-name"><i class="file-type pdf">FILE</i><span><strong>${escapeHtml(filename)}</strong><small>演示文件 · 刚刚上传</small></span></div></td><td><span class="status processing">◌ 解析中</span></td><td>—</td><td>刚刚</td><td><button class="row-menu" data-document-detail>•••</button></td>`;
  documentBody.prepend(row);
  bindDocumentRow(row);
  applyDocumentFilters();
}

function applyDocumentFilters() {
  const query = document.querySelector('[data-search="documents"]').value.trim().toLowerCase();
  const status = document.querySelector("#document-status").value;
  documentBody.querySelectorAll("tr").forEach((row) => {
    const visible = (activeFolder === "all" || row.dataset.folder === activeFolder)
      && (status === "all" || row.dataset.status === status)
      && row.textContent.toLowerCase().includes(query);
    row.classList.toggle("hidden", !visible);
  });
}

function sortDocuments() {
  const mode = document.querySelector("#document-sort").value;
  const rows = [...documentBody.querySelectorAll("tr")];
  rows.sort((a, b) => {
    if (mode === "name") return a.querySelector("strong").textContent.localeCompare(b.querySelector("strong").textContent, "zh-CN");
    const difference = Number(b.dataset.order) - Number(a.dataset.order);
    return mode === "old" ? -difference : difference;
  });
  rows.forEach((row) => documentBody.appendChild(row));
}

function bindDocumentRow(row) {
  row.querySelector("[data-document-detail]")?.addEventListener("click", () => {
    const name = row.querySelector(".file-name strong").textContent;
    openDetail({ eyebrow: "DOCUMENT", title: name, content: `<div class="detail-list"><div><span>所在目录</span><strong>${row.dataset.folder}</strong></div><div><span>处理状态</span><strong>${row.querySelector(".status").textContent.trim()}</strong></div><div><span>关联 Skill</span><strong>${row.children[2].textContent}</strong></div><div><span>更新时间</span><strong>${row.children[3].textContent}</strong></div><div><span>存储方式</span><strong>COS 原文件 · Elasticsearch 检索索引</strong></div></div>` });
  });
  row.querySelector("[data-retry-document]")?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    const status = row.querySelector(".status");
    row.dataset.status = "processing";
    status.className = "status processing";
    status.textContent = "◌ 重新解析中";
    button.disabled = true;
    button.textContent = "处理中";
    showToast("已重新提交解析任务");
    setTimeout(() => {
      row.dataset.status = "ready";
      status.className = "status ready";
      status.textContent = "● 可检索";
      const detailButton = Object.assign(document.createElement("button"), { className: "row-menu", textContent: "•••" });
      detailButton.setAttribute("data-document-detail", "");
      button.replaceWith(detailButton);
      bindDocumentRow(row);
      applyDocumentFilters();
      showToast("文档重新解析完成");
    }, 1600);
  });
}
documentBody.querySelectorAll("tr").forEach(bindDocumentRow);
document.querySelector('[data-search="documents"]').addEventListener("input", applyDocumentFilters);
document.querySelector("#document-status").addEventListener("change", applyDocumentFilters);
document.querySelector("#document-sort").addEventListener("change", sortDocuments);

// 统一 KOC 达人库与结构化筛选
const creatorRows = [...document.querySelectorAll(".creator-row")];
const creatorList = document.querySelector("#creator-list");
function filterCreators(showFeedback = true) {
  const platform = document.querySelector("#koc-platform").value;
  const category = document.querySelector("#koc-category").value;
  const region = document.querySelector("#koc-region").value;
  const followerRange = document.querySelector("#koc-followers").value;
  let count = 0;
  creatorRows.forEach((row) => {
    const followers = Number(row.dataset.followers);
    const matchesFollowers = followerRange === "all" || (followerRange === "small" && followers < 10000) || (followerRange === "middle" && followers >= 10000 && followers <= 100000) || (followerRange === "large" && followers > 100000);
    const visible = (platform === "all" || row.dataset.platform === platform)
      && (category === "all" || row.dataset.category === category)
      && (region === "all" || row.dataset.region === region)
      && matchesFollowers;
    row.classList.toggle("hidden", !visible);
    if (visible) count += 1;
  });
  document.querySelector("#creator-count").textContent = `${count} 条示例`;
  creatorList.querySelector(".empty-result")?.remove();
  if (count === 0) creatorList.insertAdjacentHTML("beforeend", '<div class="empty-result">没有匹配的示例达人，请调整筛选条件</div>');
  if (showFeedback) showToast(`找到 ${count} 位匹配达人`);
}
document.querySelector("#search-koc").addEventListener("click", () => filterCreators());
document.querySelector("#reset-koc").addEventListener("click", () => {
  ["#koc-platform", "#koc-category", "#koc-region", "#koc-followers"].forEach((selector) => { document.querySelector(selector).value = "all"; });
  filterCreators(false);
  showToast("筛选条件已清空");
});
document.querySelectorAll("[data-creator-detail]").forEach((button) => button.addEventListener("click", () => {
  const row = button.closest(".creator-row");
  const name = row.querySelector(".creator-main strong").textContent;
  openDetail({ eyebrow: "KOC PROFILE", title: name, content: `<div class="detail-list"><div><span>平台</span><strong>${row.dataset.platform === "douyin" ? "抖音" : "小红书"}</strong></div><div><span>分类</span><strong>${row.children[2].textContent}</strong></div><div><span>地区</span><strong>${row.dataset.region}</strong></div><div><span>粉丝数</span><strong>${Number(row.dataset.followers).toLocaleString("zh-CN")}</strong></div><div><span>数据来源</span><strong>运营导入 · 示例数据</strong></div></div>` });
}));
document.querySelector('[data-action="import-history"]').addEventListener("click", () => openDetail({ eyebrow: "IMPORT HISTORY", title: "KOC 导入记录", content: `<div class="import-record"><strong>小红书母婴达人_0813.xlsx</strong><span>成功 326 条</span><small>今天 13:48 · 失败 2 条</small></div><div class="import-record"><strong>生活方式达人补充.csv</strong><span>成功 184 条</span><small>昨天 18:20 · 无失败</small></div><div class="import-record"><strong>美妆 KOC 七月更新.xlsx</strong><span>成功 492 条</span><small>7 月 31 日 · 失败 6 条</small></div>` }));

// 热点指标 Mock
const metricConfig = {
  hot_keywords: { eyebrow: "TOP KEYWORDS", title: "热门关键词", detail: "关键词详情", api: "get_hot_keywords(skill_key, platform, category?, period?)", labels: ["当前热度", "相关内容", "互动总量"] },
  rising_keywords: { eyebrow: "RISING NOW", title: "飙升关键词", detail: "飙升词详情", api: "get_rising_keywords(skill_key, platform, category?, period?)", labels: ["增长速度", "新增内容", "首次上榜"] },
  hot_topics: { eyebrow: "HOT TOPICS", title: "热门话题", detail: "话题详情", api: "get_hot_topics(skill_key, platform, category?, period?)", labels: ["话题热度", "参与内容", "互动总量"] },
  hot_content: { eyebrow: "HOT CONTENT", title: "热门内容", detail: "内容详情", api: "get_hot_content(skill_key, platform, category?, period?)", labels: ["内容热度", "点赞收藏", "评论分享"] },
  category_trends: { eyebrow: "CATEGORY TRENDS", title: "行业趋势", detail: "行业详情", api: "get_category_trends(skill_key, platform, category, period?)", labels: ["行业热度", "内容增量", "互动增量"] },
  brand_geo: { eyebrow: "GEO BRAND RANKING", title: "品牌 GEO 排行", detail: "品牌 GEO 诊断", api: "get_brand_geo_insight(skill_key, platform, brand)", labels: ["GEO 可见度", "品牌提及", "内容覆盖"] },
};
const trendNames = {
  xiaohongshu: {
    hot_keywords: ["情绪价值穿搭", "控糖早餐", "县城咖啡", "低成本变美", "亲子情绪管理"],
    rising_keywords: ["薄荷曼波", "零帧起手", "公园二十分钟", "轻断食便当", "小城旅居"],
    hot_topics: ["我的夏日松弛感", "一平米改造", "带爸妈看世界", "普通人的高光", "下班后学点什么"],
    hot_content: ["通勤衣橱一周挑战", "五分钟控糖早餐", "老房低预算焕新", "夏季底妆实测", "亲子沟通示范"],
    category_trends: ["美妆个护", "母婴亲子", "家居家装", "食品饮料", "旅行户外"],
    brand_geo: ["珀莱雅", "薇诺娜", "可复美", "自然堂", "谷雨"],
  },
  douyin: {
    hot_keywords: ["轻户外通勤", "城市漫游", "新中式甜品", "反向旅游", "办公室拉伸"],
    rising_keywords: ["县城文学", "十分钟晚餐", "周末短逃离", "赛博养生", "情绪搭子"],
    hot_topics: ["夏天就要这样过", "我的家乡很宝藏", "年轻人的新夜校", "下班后的我", "今天也要好好吃饭"],
    hot_content: ["一镜到底城市漫游", "百元改造出租屋", "新中式甜品教程", "办公室肩颈操", "周末县城旅行"],
    category_trends: ["本地生活", "服饰穿搭", "食品餐饮", "旅行户外", "家居家装"],
    brand_geo: ["珀莱雅", "韩束", "自然堂", "可复美", "谷雨"],
  },
};
let trendPlatform = "xiaohongshu";
let trendMetric = "hot_keywords";

function trendItems() {
  const query = document.querySelector("#brand-query").value.trim().toLowerCase();
  const rankedNames = trendNames[trendPlatform][trendMetric].map((name, index) => ({ name, rank: index + 1 }));
  const orderedNames = trendMetric === "brand_geo" && query
    ? [...rankedNames].sort((a, b) => Number(!a.name.toLowerCase().includes(query)) - Number(!b.name.toLowerCase().includes(query)))
    : rankedNames;
  return orderedNames.map(({ name, rank }, index) => ({
    name, rank,
    heat: trendMetric === "brand_geo" ? `${(82 - index * 6.8).toFixed(0)}%` : `${(98.2 - index * 6.7 + (trendPlatform === "douyin" ? 4.4 : 0)).toFixed(1)}k`,
    growth: `+${(34.8 - index * 4.1).toFixed(1)}%`,
    content: trendMetric === "brand_geo" ? `${(76 - index * 7)}%` : (12840 - index * 1370).toLocaleString("en-US"),
    interactions: trendMetric === "brand_geo" ? `${(68 - index * 6)}%` : `${(3.6 - index * 0.42).toFixed(1)}m`,
  }));
}

function updateTrendDetail(item, index) {
  const config = metricConfig[trendMetric];
  document.querySelector("#trend-rank").textContent = String(item.rank).padStart(2, "0");
  document.querySelector("#trend-title").textContent = item.name;
  document.querySelector("#trend-growth").textContent = trendMetric === "brand_geo" ? `${trendPlatform === "xiaohongshu" ? "小红书" : "抖音"} GEO #${item.rank}` : `↗ ${item.growth}`;
  document.querySelector("#trend-heat").textContent = trendMetric === "rising_keywords" ? item.growth : item.heat;
  document.querySelector("#trend-content-count").textContent = trendMetric === "rising_keywords" ? `+${item.content}` : item.content;
  document.querySelector("#trend-interactions").textContent = trendMetric === "rising_keywords" ? `${index + 1} 天前` : item.interactions;
  config.labels.forEach((label, labelIndex) => document.querySelector(["#metric-label-one", "#metric-label-two", "#metric-label-three"][labelIndex]).textContent = label);
  const related = document.querySelector(".related");
  related.innerHTML = trendMetric === "brand_geo"
    ? '<span>需要优化</span><button data-related>品牌词内容覆盖</button><button data-related>核心品类关联</button><button data-related>权威内容引用</button>'
    : '<span>关联方向</span><button data-related>＃通勤穿搭</button><button data-related>＃松弛感</button><button data-related>＃多巴胺</button>';
  related.querySelectorAll("[data-related]").forEach((button) => button.addEventListener("click", () => showToast(`已选择：${button.textContent}`)));
  renderChart(index);
}

function renderTrends() {
  const config = metricConfig[trendMetric];
  document.querySelector("#trend-eyebrow").textContent = config.eyebrow;
  document.querySelector("#trend-list-title").textContent = config.title;
  document.querySelector("#trend-detail-label").textContent = config.detail;
  document.querySelector("#trend-api").textContent = config.api;
  document.querySelector("#brand-search-field").hidden = trendMetric !== "brand_geo";
  document.querySelector("#trend-category").hidden = trendMetric === "brand_geo";
  document.querySelector("#trend-period").hidden = trendMetric === "brand_geo";
  const list = document.querySelector("#trend-ranking");
  list.innerHTML = "";
  const items = trendItems();
  items.forEach((item, index) => {
    const row = document.createElement("button");
    row.className = `rank-item${index === 0 ? " active" : ""}`;
    row.innerHTML = `<span class="rank-num">${String(item.rank).padStart(2, "0")}</span><strong class="rank-word">${item.name}</strong><span class="rank-heat">${item.heat}</span><span class="rank-growth">${trendMetric === "brand_geo" ? "3 项待优化" : `↗ ${item.growth}`}</span>`;
    row.addEventListener("click", () => {
      list.querySelectorAll(".rank-item").forEach((node) => node.classList.remove("active"));
      row.classList.add("active");
      updateTrendDetail(item, index);
    });
    list.appendChild(row);
  });
  updateTrendDetail(items[0], 0);
}

function renderChart(seed = 0) {
  const values = [[28, 35, 41, 54, 61, 76, 92], [22, 29, 45, 39, 58, 66, 83], [31, 28, 38, 51, 47, 72, 80]][seed % 3];
  const chart = document.querySelector("#spark-chart");
  chart.innerHTML = "";
  values.forEach((value, index) => {
    const bar = document.createElement("i");
    bar.className = "spark-bar";
    bar.style.height = `${value}%`;
    bar.style.animationDelay = `${index * 0.06}s`;
    bar.dataset.day = `${index + 7}日`;
    chart.appendChild(bar);
  });
}

document.querySelectorAll(".platform-switch [data-platform]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".platform-switch [data-platform]").forEach((node) => node.classList.remove("active"));
  button.classList.add("active");
  trendPlatform = button.dataset.platform;
  renderTrends();
}));
document.querySelectorAll("[data-metric]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-metric]").forEach((node) => node.classList.remove("active"));
  button.classList.add("active");
  trendMetric = button.dataset.metric;
  renderTrends();
}));
["#trend-category", "#trend-period"].forEach((selector) => document.querySelector(selector).addEventListener("change", () => {
  renderTrends();
  showToast(`趋势范围已更新：${document.querySelector("#trend-category").value} · ${document.querySelector("#trend-period").selectedOptions[0].textContent}`);
}));
document.querySelectorAll("[data-related]").forEach((button) => button.addEventListener("click", () => showToast(`已选择关联方向：${button.textContent}`)));
document.querySelector("#brand-query").addEventListener("input", renderTrends);
document.querySelector('[data-action="api-example"]').addEventListener("click", () => {
  showView("apis");
  selectApiContract(metricConfig[trendMetric].api.split("(")[0]);
});

// 第一版业务接口目录
const commonTrendParameters = [
  ["skill_key", "string", true, "稳定的 Skill 标识，用于校验洞察能力绑定"],
  ["platform", "enum", true, "douyin 或 xiaohongshu"],
  ["category", "string", false, "标准行业分类"],
  ["period", "enum", false, "1d、7d 或 30d，默认 7d"],
];
const apiContracts = [
  {
    group: "reference", tool: "search_reference", path: "/api/v1/references/search",
    summary: "在当前 Skill 关联的 Reference 知识库中检索少量相关片段。知识库范围和检索策略由服务端决定。",
    parameters: [["skill_key", "string", true, "稳定的 Skill 标识"], ["query", "string", true, "需要检索的自然语言问题"]],
    request: { skill_key: "xiaohongshu_topic", query: "母婴行业适合做什么内容" },
    response: { results: [{ title: "小红书母婴选题方法", content: "优先从喂养、睡眠和家庭协作等高频问题中选择具体场景……" }] },
  },
  {
    group: "koc", tool: "search_koc", path: "/api/v1/koc/creators/search",
    summary: "在统一 KOC 达人库中进行确定性的结构化筛选。服务端先校验当前 Skill 已绑定 KOC 能力，不经过 RAG 或 LLM。",
    parameters: [["skill_key", "string", true, "稳定的 Skill 标识"], ["platform", "enum", true, "douyin 或 xiaohongshu"], ["category", "string", false, "标准行业分类"], ["region", "string", false, "标准地区名称"], ["min_followers", "integer", false, "最小粉丝数"], ["max_followers", "integer", false, "最大粉丝数"]],
    request: { skill_key: "xiaohongshu_koc_selection", platform: "xiaohongshu", category: "母婴", region: "上海", min_followers: 10000, max_followers: 100000 },
    response: { creators: [{ name: "小鹿妈妈的育儿日记", platform: "xiaohongshu", profile_url: "https://example.com/creator", follower_count: 52000, region: "上海", categories: ["母婴", "亲子"], tags: ["育儿经验"] }] },
  },
  {
    group: "trends", tool: "get_hot_keywords", path: "/api/v1/trends/hot-keywords", summary: "查询当前热度最高的关键词排行榜。", parameters: commonTrendParameters,
    request: { skill_key: "xiaohongshu_topic", platform: "xiaohongshu", category: "母婴", period: "7d" }, response: { items: [{ keyword: "亲子情绪管理", rank: 1, heat: 98200, growth_rate: 0.348, rank_change: 6 }] },
  },
  {
    group: "trends", tool: "get_rising_keywords", path: "/api/v1/trends/rising-keywords", summary: "查询近期增长最快的新词，用于发现尚未完全爆发的机会。", parameters: commonTrendParameters,
    request: { skill_key: "douyin_trend_radar", platform: "douyin", category: "食品餐饮", period: "7d" }, response: { items: [{ keyword: "十分钟晚餐", growth_rate: 0.412, new_content_count: 12840, first_seen_at: "2026-08-12T08:00:00+08:00" }] },
  },
  {
    group: "trends", tool: "get_hot_topics", path: "/api/v1/trends/hot-topics", summary: "查询平台热门话题或挑战。", parameters: commonTrendParameters,
    request: { skill_key: "xiaohongshu_topic", platform: "xiaohongshu", period: "7d" }, response: { items: [{ topic_id: "topic_01", title: "我的夏日松弛感", heat: 91800, content_count: 16200, interaction_count: 4280000 }] },
  },
  {
    group: "trends", tool: "get_hot_content", path: "/api/v1/trends/hot-content", summary: "查询具有代表性的热门视频或笔记。", parameters: [...commonTrendParameters, ["keyword", "string", false, "限定关键词"]],
    request: { skill_key: "xiaohongshu_topic", platform: "xiaohongshu", keyword: "控糖早餐", period: "7d" }, response: { items: [{ content_id: "note_01", title: "五分钟控糖早餐", content_url: "https://example.com/content", like_count: 28600, comment_count: 920, collect_count: 13800, share_count: 2100, published_at: "2026-08-12T09:30:00+08:00" }] },
  },
  {
    group: "trends", tool: "get_category_trends", path: "/api/v1/trends/category-trends", summary: "查询指定行业的整体热度和内容增长趋势。", parameters: [["skill_key", "string", true, "稳定的 Skill 标识，用于校验热点能力绑定"], ["platform", "enum", true, "douyin 或 xiaohongshu"], ["category", "string", true, "标准行业分类"], ["period", "enum", false, "1d、7d 或 30d"]],
    request: { skill_key: "xiaohongshu_topic", platform: "xiaohongshu", category: "美妆个护", period: "30d" }, response: { category: "美妆个护", heat: 96800, heat_growth_rate: 0.213, content_growth_rate: 0.176, interaction_growth_rate: 0.248 },
  },
  {
    group: "trends", tool: "get_keyword_trend", path: "/api/v1/trends/keyword-trend", summary: "查询一个关键词在指定周期内的时间序列。", parameters: [["skill_key", "string", true, "稳定的 Skill 标识，用于校验热点能力绑定"], ["platform", "enum", true, "douyin 或 xiaohongshu"], ["keyword", "string", true, "目标关键词"], ["period", "enum", false, "7d 或 30d"]],
    request: { skill_key: "xiaohongshu_topic", platform: "xiaohongshu", keyword: "情绪价值穿搭", period: "7d" }, response: { keyword: "情绪价值穿搭", points: [{ date: "2026-08-13", heat: 98200, content_count: 12840, interaction_count: 3600000 }] },
  },
  {
    group: "trends", tool: "get_related_keywords", path: "/api/v1/trends/related-keywords", summary: "查询关键词的关联方向，用于扩展选题矩阵。", parameters: [["skill_key", "string", true, "稳定的 Skill 标识，用于校验热点能力绑定"], ["platform", "enum", true, "douyin 或 xiaohongshu"], ["keyword", "string", true, "目标关键词"]],
    request: { skill_key: "xiaohongshu_topic", platform: "xiaohongshu", keyword: "情绪价值穿搭" }, response: { keyword: "情绪价值穿搭", items: [{ keyword: "通勤穿搭", relevance: 0.92, heat: 76400 }] },
  },
  {
    group: "trends", tool: "get_content_format_trends", path: "/api/v1/trends/content-format-trends", summary: "查询近期表现较好的内容形式及其互动指标。", parameters: commonTrendParameters,
    request: { skill_key: "xiaohongshu_topic", platform: "xiaohongshu", category: "美妆", period: "7d" }, response: { items: [{ format: "video", content_share: 0.63, average_interactions: 8420, growth_rate: 0.184 }] },
  },
  {
    group: "trends", tool: "get_hot_creators", path: "/api/v1/trends/hot-creators", summary: "查询第三方趋势数据中近期制造热点的达人，不等同于运营维护的 KOC 达人库。", parameters: commonTrendParameters,
    request: { skill_key: "douyin_trend_radar", platform: "douyin", category: "旅行户外", period: "7d" }, response: { items: [{ creator_id: "creator_01", name: "城市漫游者", follower_count: 486000, recent_interactions: 920000, viral_content_count: 4, heat_growth_rate: 0.286 }] },
  },
  {
    group: "trends", tool: "get_trend_detail", path: "/api/v1/trends/details", summary: "根据前序榜单返回的 trend_id 查询一个热点的完整指标。", parameters: [["skill_key", "string", true, "稳定的 Skill 标识，用于校验热点能力绑定"], ["platform", "enum", true, "douyin 或 xiaohongshu"], ["trend_id", "string", true, "榜单返回的热点标识"]],
    request: { skill_key: "xiaohongshu_topic", platform: "xiaohongshu", trend_id: "trend_01" }, response: { trend_id: "trend_01", title: "情绪价值穿搭", current_heat: 98200, peak_heat: 102400, started_at: "2026-08-07T00:00:00+08:00", related_keywords: ["通勤穿搭", "松弛感"], representative_content_ids: ["note_01", "note_02"] },
  },
  {
    group: "trends", tool: "get_brand_geo_insight", path: "/api/v1/insights/brand-geo", summary: "查询指定品牌在小红书或抖音的 GEO 排名、可见度指标及需要优化的内容方向。",
    parameters: [["skill_key", "string", true, "稳定的 Skill 标识，用于校验洞察能力绑定"], ["platform", "enum", true, "douyin 或 xiaohongshu"], ["brand", "string", true, "需要诊断的品牌名称"]],
    request: { skill_key: "xiaohongshu_topic", platform: "xiaohongshu", brand: "可复美" },
    response: { brand: "可复美", platform: "xiaohongshu", geo_rank: 3, geo_visibility: 68, mention_coverage: 62, content_coverage: 56, optimization_items: ["增加品牌词与核心品类的内容覆盖", "补充可被引用的成分与功效证据", "提高权威账号和高质量内容的引用占比"] },
  },
];

function renderApiCatalog() {
  ["reference", "koc", "trends"].forEach((group) => {
    const list = document.querySelector(`#${group}-api-list`);
    list.innerHTML = "";
    apiContracts.filter((contract) => contract.group === group).forEach((contract) => {
      const button = document.createElement("button");
      button.className = "api-list-item";
      button.dataset.apiTool = contract.tool;
      button.innerHTML = `<span class="http-method post">POST</span><strong>${contract.tool}</strong><code>${contract.path}</code>`;
      button.addEventListener("click", () => selectApiContract(contract.tool));
      list.appendChild(button);
    });
  });
  selectApiContract("search_reference");
}

function selectApiContract(tool) {
  const contract = apiContracts.find((item) => item.tool === tool);
  if (!contract) return;
  document.querySelectorAll(".api-list-item").forEach((item) => item.classList.toggle("active", item.dataset.apiTool === tool));
  document.querySelector("#contract-method").textContent = "POST";
  document.querySelector("#contract-path").textContent = contract.path;
  document.querySelector("#contract-tool").textContent = contract.tool;
  document.querySelector("#contract-summary").textContent = contract.summary;
  document.querySelector("#contract-parameters").innerHTML = contract.parameters.map(([name, type, required, description]) => `<div class="parameter-row"><code>${name}</code><span>${type}</span><b>${required ? "必填" : "可选"}</b><p>${description}</p></div>`).join("");
  document.querySelector("#contract-request").textContent = JSON.stringify(contract.request, null, 2);
  document.querySelector("#contract-response").textContent = JSON.stringify(contract.response, null, 2);
}

document.querySelectorAll("[data-open-api]").forEach((button) => button.addEventListener("click", () => {
  showView("apis");
  selectApiContract(button.dataset.openApi);
}));

// 其余可点击项
document.querySelectorAll(".toast-trigger").forEach((button) => button.addEventListener("click", () => showToast()));
document.querySelector(".profile").addEventListener("click", () => openDetail({ eyebrow: "ACCOUNT", title: "运营管理员", content: '<div class="detail-list"><div><span>工作区</span><strong>小题内部工作台</strong></div><div><span>角色</span><strong>超级管理员</strong></div><div><span>数据权限</span><strong>全部知识库与数据能力</strong></div></div>' }));

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeUpload();
  closeBackdrop(formModal);
  closeBackdrop(detailModal);
  closeSkillDrawer();
});

renderTrends();
renderApiCatalog();
updateInsightBoundCount();
