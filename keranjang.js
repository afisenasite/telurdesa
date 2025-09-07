document.addEventListener('DOMContentLoaded', function() {

    // --- PENGATURAN AWAL ---
    const cartContentEl = document.getElementById('keranjang-konten');
    const cartTotalEl = document.getElementById('keranjang-total');
    const whatsappButtonEl = document.getElementById('tombol-pesan-wa-kustom');
    const nomorWhatsapp = '6282247612064'; // GANTI DENGAN NOMOR TUJUAN

    // --- FUNGSI DASAR KERANJANG ---
    function loadCart() {
        return JSON.parse(localStorage.getItem('telurDesaCart')) || {};
    }

    function saveCart(cart) {
        localStorage.setItem('telurDesaCart', JSON.stringify(cart));
        renderCartOnPage();
        updateHeaderCart();
    }

    function addToCart(productId, productName, productPrice, quantity) {
        const cart = loadCart();
        const qty = parseInt(quantity, 10) || 1; // Default ke 1 jika tidak ada jumlah
        if (cart[productId]) {
            cart[productId].quantity += qty;
        } else {
            cart[productId] = { name: productName, price: parseFloat(productPrice), quantity: qty };
        }
        saveCart(cart);
        alert((qty > 1 ? qty + ' x ' : '') + '"' + productName + '" telah ditambahkan ke keranjang!');
    }

    function updateQuantity(productId, newQuantity) {
        const cart = loadCart();
        if (cart[productId]) {
            if (newQuantity > 0) {
                cart[productId].quantity = newQuantity;
            } else {
                delete cart[productId];
            }
            saveCart(cart);
        }
    }

    // --- FUNGSI TAMPILAN (RENDER) ---
    function renderCartOnPage() {
        if (!cartContentEl) return;
        const cart = loadCart();
        if (Object.keys(cart).length === 0) {
            cartContentEl.innerHTML = '<p>Keranjang Anda masih kosong.</p>';
            cartTotalEl.innerHTML = '';
            if (whatsappButtonEl) whatsappButtonEl.style.display = 'none';
            return;
        }
        let html = '<table style="width: 100%; border-collapse: collapse;">';
        html += '<thead><tr><th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Produk</th><th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Jumlah</th><th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Subtotal</th><th style="padding: 8px; border-bottom: 1px solid #ddd;"></th></tr></thead><tbody>';
        let total = 0;
        let pesanWA = 'Halo, saya ingin memesan:\n\n';
        for (const productId in cart) {
            const item = cart[productId];
            const subtotal = item.price * item.quantity;
            total += subtotal;
            html += `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 15px 8px;">${item.name}</td><td style="padding: 8px;"><input type="number" class="input-qty" value="${item.quantity}" min="1" data-id="${productId}" style="width: 60px; text-align: center;"></td><td style="text-align: right; padding: 8px;">Rp${subtotal.toLocaleString('id-ID')}</td><td style="text-align: center; padding: 8px;"><button class="tombol-hapus" data-id="${productId}" style="color: red; background: none; border: none; cursor: pointer;">Hapus</button></td></tr>`;
            pesanWA += `- ${item.name} (Jumlah: ${item.quantity})\n`;
        }
        html += '</tbody></table>';
        pesanWA += `\n*Total Belanja: Rp${total.toLocaleString('id-ID')}*`;
        cartContentEl.innerHTML = html;
        cartTotalEl.innerHTML = `<h4 style="text-align: right;">Total Belanja: Rp${total.toLocaleString('id-ID')}</h4>`;
        if (whatsappButtonEl) {
            whatsappButtonEl.href = `https://api.whatsapp.com/send?phone=${nomorWhatsapp}&text=${encodeURIComponent(pesanWA)}`;
            whatsappButtonEl.style.display = 'inline-block';
        }
    }

    function updateHeaderCart() {
        const cart = loadCart();
        const headerCartCountEl = document.getElementById('header-cart-count');
        const miniCartContentEl = document.getElementById('mini-cart-content');
        let totalItems = 0;
        for (const productId in cart) {
            totalItems += cart[productId].quantity;
        }
        if (headerCartCountEl) {
            headerCartCountEl.textContent = totalItems;
        }
        setTimeout(function() {
            if (miniCartContentEl) {
                if (totalItems === 0) {
                    miniCartContentEl.innerHTML = '<p class="woocommerce-mini-cart__empty-message" style="padding: 1em;">Tidak ada produk di keranjang.</p>';
                } else {
                    let html = '<ul class="woocommerce-mini-cart cart_list product_list_widget">';
                    let total = 0;
                    for (const productId in cart) {
                        const item = cart[productId];
                        total += item.price * item.quantity;
                        html += `
                            <li class="woocommerce-mini-cart-item">
                                <a>
                                    ${item.name} <br>
                                    <span class="quantity">${item.quantity} × <span class="woocommerce-Price-amount amount">Rp${item.price.toLocaleString('id-ID')}</span></span>
                                </a>
                            </li>
                        `;
                    }
                    html += '</ul>';
                    html += `<p class="woocommerce-mini-cart__total total"><strong>Subtotal:</strong> <span class="woocommerce-Price-amount amount">Rp${total.toLocaleString('id-ID')}</span></p>`;
                    // --- INILAH LOGIKA BARU BERDASARKAN IDE ANDA ---
                    let cartUrl = 'cart/index.html'; // Default untuk halaman utama
                    const currentPath = window.location.pathname;

                    if ( currentPath.includes('/shop/') || currentPath.includes('/about/') || currentPath.includes('/contact/') || currentPath.includes('/blog/') || currentPath.includes('/faq/') ) {
                        // Jika di halaman shop, about, dll. (kedalaman 1 folder)
                        cartUrl = '../cart/index.html';
                    } else if ( currentPath.includes('/product/') ) {
                        // Jika di halaman detail produk (kedalaman 2 folder)
                        cartUrl = '../../cart/index.html';
                    }
                    // --- AKHIR DARI LOGIKA BARU ---

                    html += `<p class="woocommerce-mini-cart__buttons buttons"><a href="${cartUrl}" class="button wc-forward">Lihat Keranjang</a></p>`;
                    
                    miniCartContentEl.innerHTML = html;
                }
            }
        }, 100);
    }

    // --- PENDENGAR AKSI (EVENT LISTENERS) ---
    document.querySelectorAll('.tombol-tambah-produk').forEach(button => {
        button.addEventListener('click', function() {
            let quantity = 1;
            // --- PERBAIKAN LOGIKA TOMBOL ---
            // Cek apakah ada elemen input jumlah di dekatnya
            const quantityWrapper = this.previousElementSibling;
            if (quantityWrapper && quantityWrapper.classList.contains('quantity-input')) {
                const quantityInput = quantityWrapper.querySelector('.input-jumlah-produk');
                if (quantityInput) {
                    quantity = quantityInput.value;
                }
            }
            
            const id = this.dataset.id;
            const name = this.dataset.name;
            const price = this.dataset.price;
            
            addToCart(id, name, price, quantity);
        });
    });

    if (cartContentEl) {
        cartContentEl.addEventListener('change', function(e) { if (e.target.classList.contains('input-qty')) { updateQuantity(e.target.dataset.id, parseInt(e.target.value)); } });
        cartContentEl.addEventListener('click', function(e) { if (e.target.classList.contains('tombol-hapus')) { updateQuantity(e.target.dataset.id, 0); } });
    }

    // --- INISIALISASI ---
    renderCartOnPage();
    updateHeaderCart();
});

// --- FUNGSI BARU UNTUK MENGOSONGKAN KERANJANG SETELAH KLIK WA ---

document.addEventListener('DOMContentLoaded', function() {
    // Cari tombol berdasarkan ID yang kita buat di Langkah 1
    const tombolPesanWA = document.getElementById('tombol-pesan-wa-kustom');

    if (tombolPesanWA) {
        tombolPesanWA.addEventListener('click', function(e) {
            // 1. Mencegah link langsung berjalan agar kita bisa kontrol
            e.preventDefault();

            // 2. Ambil URL WhatsApp dari tombol
            const whatsappUrl = this.href;

            // 3. Buka WhatsApp di tab baru
            window.open(whatsappUrl, '_blank');

            // 4. Kosongkan keranjang di penyimpanan browser
            localStorage.removeItem('telurDesaCart');

            // 5. Muat ulang halaman untuk menampilkan keranjang kosong
            window.location.reload();
        });
    }
});