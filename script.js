// Fungsi untuk menampilkan section
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(section).style.display = 'block';
}

// Load data dari localStorage
let stock = JSON.parse(localStorage.getItem('stock')) || [];
let history = JSON.parse(localStorage.getItem('history')) || [];
let employees = JSON.parse(localStorage.getItem('employees')) || [];

// Update tabel stok
function updateStockTable() {
    const table = document.getElementById('stockTable');
    table.innerHTML = '';
    stock.forEach((item, index) => {
        const row = `<tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>Rp ${item.unitPrice || 0}</td>
            <td>Rp ${item.packPrice || 0}</td>
            <td>${item.employee}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteItem(${index})">Hapus</button></td>
        </tr>`;
        table.innerHTML += row;
    });
    updateItemSelect();
}

// Update dropdown barang untuk keluar
function updateItemSelect() {
    const select = document.getElementById('removeItemName');
    select.innerHTML = '<option value="">Pilih Barang</option>';
    stock.forEach(item => {
        select.innerHTML += `<option value="${item.name}">${item.name} (Stok: ${item.quantity})</option>`;
    });
}

// Tambah barang (masuk)
document.getElementById('addForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('itemName').value.trim();
    const quantity = parseInt(document.getElementById('quantity').value);
    const unitPrice = parseFloat(document.getElementById('unitPrice').value);
    const packPrice = parseFloat(document.getElementById('packPrice').value);
    const employee = document.getElementById('employee').value;
    if (name && quantity > 0 && unitPrice >= 0 && packPrice >= 0 && employee) {
        const existingIndex = stock.findIndex(item => item.name.toLowerCase() === name.toLowerCase());
        if (existingIndex !== -1) {
            stock[existingIndex].quantity += quantity;
            stock[existingIndex].unitPrice = unitPrice;
            stock[existingIndex].packPrice = packPrice;
            stock[existingIndex].employee = employee;
            addToHistory('Masuk', name, quantity, employee);
        } else {
            stock.push({ name, quantity, unitPrice, packPrice, employee });
            addToHistory('Masuk Baru', name, quantity, employee);
        }
        localStorage.setItem('stock', JSON.stringify(stock));
        updateStockTable();
        this.reset();
        alert('Barang berhasil ditambahkan!');
    } else {
        alert('Harap isi semua field dengan benar!');
    }
});

// Barang keluar
document.getElementById('removeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('removeItemName').value;
    const quantity = parseInt(document.getElementById('removeQuantity').value);
    const employee = document.getElementById('removeEmployee').value;
    if (name && quantity > 0 && employee) {
        const existingIndex = stock.findIndex(item => item.name === name);
        if (existingIndex !== -1 && stock[existingIndex].quantity >= quantity) {
            stock[existingIndex].quantity -= quantity;
            addToHistory('Keluar', name, quantity, employee);
            localStorage.setItem('stock', JSON.stringify(stock));
            updateStockTable();
            this.reset();
        } else {
            alert('Stok tidak cukup atau barang tidak ditemukan!');
        }
    } else {
        alert('Harap isi semua field dengan benar!');
    }
});

// Hapus item
function deleteItem(index) {
    if (confirm('Yakin hapus item ini?')) {
        const item = stock[index];
        addToHistory('Hapus', item.name, item.quantity, item.employee);
        stock.splice(index, 1);
        localStorage.setItem('stock', JSON.stringify(stock));
        updateStockTable();
    }
}

// Tambah ke riwayat
function addToHistory(action, item, quantity, employee) {
    const now = new Date();
    const timestamp = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    history.push({ timestamp, action, item, quantity, employee });
    localStorage.setItem('history', JSON.stringify(history));
    updateHistoryTable();
}

// Update tabel riwayat
function updateHistoryTable() {
    const table = document.getElementById('historyTable');
    table.innerHTML = '';
    history.forEach(entry => {
        table.innerHTML += `<tr>
            <td>${entry.timestamp}</td>
            <td>${entry.action}</td>
            <td>${entry.item}</td>
            <td>${entry.quantity}</td>
            <td>${entry.employee}</td>
        </tr>`;
    });
}

// Generate laporan bulanan
document.getElementById('reportForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const month = parseInt(document.getElementById('reportMonth').value);
    const year = parseInt(document.getElementById('reportYear').value);
    const filtered = history.filter(entry => {
        const date = new Date(entry.timestamp.split(' ')[0].split('/').reverse().join('-'));
        return date.getMonth() + 1 === month && date.getFullYear() === year;
    });
    const table = document.getElementById('reportTable');
    table.innerHTML = '';
    filtered.forEach(entry => {
        table.innerHTML += `<tr>
            <td>${entry.timestamp}</td>
            <td>${entry.action}</td>
            <td>${entry.item}</td>
            <td>${entry.quantity}</td>
            <td>${entry.employee}</td>
        </tr>`;
    });
    document.getElementById('reportTitle').textContent = `${document.getElementById('reportMonth').options[month].text} ${year}`;
    document.getElementById('reportResult').style.display = 'block';
});

// Update dropdown karyawan
function updateEmployeeSelect() {
    const selects = ['employee', 'removeEmployee'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        select.innerHTML = '<option value="">Pilih Karyawan</option>';
        employees.forEach(emp => {
            select.innerHTML += `<option value="${emp.name}">${emp.name} (${emp.id})</option>`;
        });
    });
}

// Tambah