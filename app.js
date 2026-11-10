/*
  ============================================================
  FILE: app.js
  Katalog UMKM + Local Storage
  Data yang disimpan di browser:
  1. Daftar produk
  2. Keranjang belanja
  3. Riwayat pesanan
  
  ============================================================
*/

// 1. PENGATURAN TOKO
const storeConfig = {
  name: "Rasa yang terlupakan",
  whatsapp: "628566298858",
  address: "Medan, Sumatera Utara",
  hours: "08.00-19.00 WIB"
};

// 2. DATA PRODUK AWAL
// Data ini hanya dipakai saat pertama kali website dibuka.
// Setelah itu, daftar produk dibaca dari Local Storage.
const defaultProducts = [
  {
    id: 1,
    name: "Mie Gomak",
    category: "Makanan",
    price: 12000,
    stock: 14,
    description: "Mie khas Batak dengan bumbu rempah yang gurih.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQrCN_TFIQkxNi3u-gMCvrwb6Nk0MDIMiT2_X2tGs--A&s=10"
  },
  {
    id: 2,
    name: "Soto Medan",
    category: "Makanan",
    price: 16000,
    stock: 30,
    description: "Soto berkuah santan dengan rempah khas Medan.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwPl0p9wU0lOFLL6E6Cq11HrdagEVwchlxN4Y53x92ng&s=10"
  },
  {
    id: 3,
    name: "Bika Ambon",
    category: "Camilan",
    price: 35000,
    stock: 16,
    description: "Kue tradisional bertekstur kenyal dan berserat.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiR_iYzUs_dyRRRJZr1Tgf8bef0c7V6JiK5bxY6KGdvg&s=10"
  },
  {
    id: 4,
    name: "Lontong Medan",
    category: "Makanan",
    price: 10000,
    stock: 17,
    description: "Lontong dengan sayur, sambal, dan pelengkap.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToH6HUpHTnpydZP8-4ZfO7K8CZU83jrjA7ep4HJtogoA&s=10"
  },
  {
    id: 5,
    name: "Kopi Susu",
    category: "Minuman",
    price: 12000,
    stock: 15,
    description: "Kopi susu dingin dengan rasa seimbang.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPrj01rvaX67M2pqXjETPWS5pF_zrdfWSabY-I7jMx8Q&s=10"
  },
  {
    id: 6,
    name: "Durian",
    category: "Camilan",
    price: 35000,
    stock: 4,
    description: "Durian pilihan, nikmat disantap bersama keluarga.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZa27G_9SvOD28-YIcspERV9qsvAlJGxMux-_LEi7EcA&s=10"
  },
  {
    id: 7,
    name: "Jus Alpukat",
    category: "Minuman",
    price: 15000,
    stock: 8,
    description: "Jus alpukat segar, menemani harimu setiap saat.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSYX3bileVnGiOmqE1-h6ur4c15V37RUQQj3YjNCjXFw&s=10"
  }
];

// 3. NAMA KUNCI LOCAL STORAGE
const STORAGE_KEYS = {
  products: "rasaTerlupakan_products_v1",
  cart: "rasaTerlupakan_cart_v1",
  orders: "rasaTerlupakan_orders_v1",
  customer: "rasaTerlupakan_customer_v1"
};

// Ambil data dari Local Storage dengan aman.
function loadFromStorage(key, fallbackValue) {
  try {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : fallbackValue;
  } catch (error) {
    console.error("Gagal membaca Local Storage:", error);
    return fallbackValue;
  }
}

// Simpan data ke Local Storage.
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    alert("Data tidak dapat disimpan. Periksa ruang penyimpanan browser.");
    console.error("Gagal menyimpan Local Storage:", error);
  }
}

// Daftar produk, keranjang, dan riwayat dipulihkan saat halaman dibuka.
let products = loadFromStorage(STORAGE_KEYS.products, null);

if (!Array.isArray(products)) {
  products = [...defaultProducts];
}

// Memberikan stok awal untuk produk lama yang belum memiliki data stok.
products = products.map(product => ({
  ...product,
  stock:
    product.stock !== undefined &&
    product.stock !== null &&
    product.stock !== ""
      ? Math.max(0, Number(product.stock) || 0)
      : 20
}));

saveToStorage(STORAGE_KEYS.products, products);

let cart = loadFromStorage(STORAGE_KEYS.cart, []);
if (!Array.isArray(cart)) cart = [];

let orderHistory = loadFromStorage(STORAGE_KEYS.orders, []);
if (!Array.isArray(orderHistory)) orderHistory = [];

// 4. ELEMEN HALAMAN
const menuList = document.getElementById("menuList");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const cartItemsElement = document.getElementById("cartItems");
const cartCountElement = document.getElementById("cartCount");
const cartTotalElement = document.getElementById("cartTotal");
const checkoutButton = document.getElementById("checkoutButton");
const productForm = document.getElementById("productForm");
const manageProductList = document.getElementById("manageProductList");
const orderHistoryList = document.getElementById("orderHistoryList");
const customerNameInput = document.getElementById("customerName");

// 5. FUNGSI BANTU
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(number);
}

// Mencegah teks yang diketik pengguna dibaca sebagai HTML.
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function normalizeCategory(category) {
  const value = String(category || "").toLowerCase();
  if (value === "makanan") return "Makanan";
  if (value === "minuman") return "Minuman";
  if (value === "camilan") return "Camilan";
  return "Makanan";
}

// 6. TAMPILKAN IDENTITAS TOKO
function setupStoreInfo() {
  document.title = `${storeConfig.name} | Katalog UMKM`;
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };
  setText("brandNameNav", storeConfig.name);
  setText("brandNameFooter", storeConfig.name);
  setText("brandNameCopyright", storeConfig.name);
  setText("storeAddress", storeConfig.address);
  setText("storeHours", storeConfig.hours);
  setText("year", new Date().getFullYear());

  const contactLink = document.getElementById("contactLink");
  const phone = storeConfig.whatsapp.replace(/\D/g, "");
  if (contactLink) {
    contactLink.href =
      `https://wa.me/${phone}?text=${encodeURIComponent("Halo, saya ingin bertanya tentang produk.")}`;
  }
}

// 7. TAMPILKAN KATALOG PRODUK
function renderProducts() {
  // Fungsi ini hanya berjalan pada halaman yang memiliki katalog.
  if (!menuList || !searchInput || !categoryFilter) return;
  const keyword = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filteredProducts = products.filter(product => {
    const matchName = product.name.toLowerCase().includes(keyword) ||
      product.description.toLowerCase().includes(keyword);
    const matchCategory = selectedCategory === "Semua" ||
      normalizeCategory(product.category) === selectedCategory;
    return matchName && matchCategory;
  });

  menuList.innerHTML = "";

  filteredProducts.forEach(product => {
    const safeName = escapeHTML(product.name);
    const safeDescription = escapeHTML(product.description);
    const safeCategory = escapeHTML(normalizeCategory(product.category));
    const safeImage = escapeHTML(product.image || "");
    const stock = Math.max(0, Number(product.stock) || 0);

    menuList.innerHTML += `
      <div class="col-sm-6 col-lg-4">
        <article class="card menu-card">
          <img src="${safeImage}" class="card-img-top menu-img"
               alt="${safeName}" loading="lazy"
               onerror="this.src='https://placehold.co/800x500?text=Foto+Menu'">
          <div class="card-body d-flex flex-column p-4">
            <div class="mb-2">
              <span class="badge category-pill rounded-pill">${safeCategory}</span>
            </div>
            <h5 class="card-title fw-bold">${safeName}</h5>
            <p class="card-text text-secondary small flex-grow-1">${safeDescription}</p>
            <div class="d-flex justify-content-between align-items-center gap-2">
              <span class="price">${formatRupiah(Number(product.price))}</span>
              <div class="d-flex justify-content-between align-items-center mb-3">
  <span class="small text-secondary">
    Stok: <strong>${stock}</strong>
  </span>

  ${
    stock > 0
      ? `<span class="badge text-bg-success">Tersedia</span>`
      : `<span class="badge text-bg-danger">Stok Habis</span>`
  }
</div>

<button
  class="btn btn-brand btn-sm rounded-pill px-3"
  onclick="addToCart(${Number(product.id)})"
  ${stock <= 0 ? "disabled" : ""}
>
  <i class="bi bi-plus-lg me-1"></i>Tambah
</button>
            </div>
          </div>
        </article>
      </div>`;
  });

  const emptyMessage = document.getElementById("emptyMessage");
  if (emptyMessage) {
    emptyMessage.classList.toggle("d-none", filteredProducts.length > 0);
  }
}


// 9. KERANJANG BELANJA
function addToCart(productId) {
  const product = products.find(
    item => Number(item.id) === Number(productId)
  );

  if (!product) return;

  const existingItem = cart.find(
    item => Number(item.id) === Number(productId)
  );

  const quantityInCart = existingItem
    ? Number(existingItem.quantity)
    : 0;

  if (quantityInCart >= Number(product.stock)) {
    alert("Maaf, stok produk tidak mencukupi!");
    return;
  }

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  saveToStorage(STORAGE_KEYS.cart, cart);
  renderCart();
}

function changeQuantity(productId, amount) {
  const itemIndex = cart.findIndex(
    item => Number(item.id) === Number(productId)
  );

  if (itemIndex === -1) return;

  const product = products.find(
    item => Number(item.id) === Number(productId)
  );

  if (!product) return;

  const newQuantity = cart[itemIndex].quantity + amount;

  if (newQuantity > Number(product.stock)) {
    alert("Jumlah pembelian melebihi stok yang tersedia!");
    return;
  }

  if (newQuantity <= 0) {
    cart.splice(itemIndex, 1);
  } else {
    cart[itemIndex].quantity = newQuantity;
  }

  saveToStorage(STORAGE_KEYS.cart, cart);
  renderCart();
}

function renderCart() {
  // Halaman pengelolaan tidak wajib memiliki panel keranjang.
  if (!cartItemsElement) return;
  cartItemsElement.innerHTML = "";

  if (cart.length === 0) {
    cartItemsElement.innerHTML = '<p class="text-secondary">Keranjang masih kosong.</p>';
  }

  let total = 0;
  let totalQuantity = 0;

  cart.forEach(item => {
    total += Number(item.price) * Number(item.quantity);
    totalQuantity += Number(item.quantity);

    cartItemsElement.innerHTML += `
      <div class="d-flex justify-content-between align-items-center border-bottom py-3 gap-2">
        <div>
          <div class="fw-semibold">${escapeHTML(item.name)}</div>
          <div class="small text-secondary">${formatRupiah(Number(item.price))} × ${Number(item.quantity)}</div>
        </div>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" onclick="changeQuantity(${Number(item.id)}, -1)" aria-label="Kurangi">-</button>
          <button class="btn btn-outline-secondary" onclick="changeQuantity(${Number(item.id)}, 1)" aria-label="Tambah">+</button>
        </div>
      </div>`;
  });

  cartCountElement.textContent = totalQuantity;
  cartTotalElement.textContent = formatRupiah(total);
  if (checkoutButton) checkoutButton.disabled = cart.length === 0;
}

// Simpan nama pemesan ketika berubah.
if (customerNameInput) {
  customerNameInput.value = loadFromStorage(STORAGE_KEYS.customer, "");
  customerNameInput.addEventListener("input", () => {
    saveToStorage(STORAGE_KEYS.customer, customerNameInput.value);
  });
}

// 10. CHECKOUT WHATSAPP + SIMPAN RIWAYAT PESANAN
function checkoutWhatsApp() {
  if (!customerNameInput || !checkoutButton) return;
  if (cart.length === 0) {
    alert("Keranjang masih kosong. Tambahkan menu terlebih dahulu.");
    return;
  }

  const customerName = customerNameInput.value.trim();
  if (!customerName) {
    alert("Silakan isi nama pemesan terlebih dahulu.");
    customerNameInput.focus();
    return;
  }

  const phone = storeConfig.whatsapp.replace(/\D/g, "");
  if (!phone || phone.length < 9) {
    alert("Periksa nomor WhatsApp toko pada pengaturan storeConfig di app.js.");
    return;
  }

  const orderItems = cart.map(item => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    quantity: Number(item.quantity)
  }));

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    id: Date.now(),
    customerName,
    items: orderItems,
    total,
    date: new Date().toLocaleString("id-ID"),
    status: "Dikirim ke WhatsApp"
  };

  let message = `Halo ${storeConfig.name}, saya ingin memesan:\n`;
  message += `Nama: ${customerName}\n\n`;
  orderItems.forEach((item, index) => {
    message += `${index + 1}. ${item.name} (${item.quantity} x ${formatRupiah(item.price)}) = ${formatRupiah(item.price * item.quantity)}\n`;
  });
  message += `\nTotal: ${formatRupiah(total)}\n`;
  message += "\nMohon konfirmasi pesanan saya. Terima kasih.";

  // Kurangi stok berdasarkan jumlah produk yang dipesan.
orderItems.forEach(item => {
  const product = products.find(
    p => Number(p.id) === Number(item.id)
  );

  if (product) {
    product.stock -= item.quantity;
  }
});

// Simpan stok terbaru.
saveToStorage(STORAGE_KEYS.products, products);

// Simpan riwayat pesanan.
orderHistory.unshift(order);
saveToStorage(STORAGE_KEYS.orders, orderHistory);
renderOrderHistory();

// Perbarui tampilan katalog dan pengelolaan menu.
renderProducts();
renderManageProducts();

  // Buka WhatsApp dengan isi pesanan.
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

  // Kosongkan keranjang setelah pesanan dicatat.
  cart = [];
  saveToStorage(STORAGE_KEYS.cart, cart);
  renderCart();
}


// 12. SLIDESHOW FOTO PRODUK
let slideIndex = 0;
const aboutSlideshow = document.getElementById("aboutSlideshow");

function updateSlideshowProducts() {
  if (!aboutSlideshow) return;

  if (products.length === 0) {
    aboutSlideshow.removeAttribute("src");
    aboutSlideshow.alt = "Belum ada foto produk";
    return;
  }

  if (slideIndex >= products.length) slideIndex = 0;
  aboutSlideshow.src = products[slideIndex].image;
  aboutSlideshow.alt = products[slideIndex].name;
}

updateSlideshowProducts();

setInterval(() => {
  if (!products.length) return;
  slideIndex = (slideIndex + 1) % products.length;
  updateSlideshowProducts();
}, 3000);

// 13. EVENT LISTENERS
if (searchInput) searchInput.addEventListener("input", renderProducts);
if (categoryFilter) categoryFilter.addEventListener("change", renderProducts);
if (checkoutButton) checkoutButton.addEventListener("click", checkoutWhatsApp);
if (productForm) productForm.addEventListener("submit", addProduct);

// 14. JALANKAN SAAT WEBSITE DIBUKA
setupStoreInfo();
renderProducts();
renderCart();
renderManageProducts();
renderOrderHistory();
