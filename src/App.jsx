import React, { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:5017";

function App() {
  const [pegawaiList, setPegawaiList] = useState([]);
  const [pegawaiDetailsList, setPegawaiDetailsList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);
  const [activeTab, setActiveTab] = useState("pegawai");
  const [uploadedFilesList, setUploadedFilesList] = useState([]);

  const [newCabangName, setNewCabangName] = useState("");
  const [newCabangCode, setNewCabangCode] = useState("");
  const [newJabatanName, setNewJabatanName] = useState("");

  const [newPegawai, setNewPegawai] = useState({
    namaPegawai: "",
    kodePegawai: "",
    idJabatan: "",
    idCabang: "",
    tanggalMulaiKontrak: "",
    tanggalHabisKontrak: "",
  });

  const [excelFile, setExcelFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");

  const [searchParams, setSearchParams] = useState({
    namaPegawai: "",
    kodePegawai: "",
    kodeCabang: "",
    namaCabang: "",
    namaJabatan: "",
    tanggalMulaiKontrak: "",
    tanggalHabisKontrak: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [downloading, setDownloading] = useState(false);
  const [initialSearch, setInitialSearch] = useState(true);

  const fetchPegawai = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/pegawai`);
      if (!response.ok) throw new Error("Gagal mengambil data pegawai.");
      const data = await response.json();
      setPegawaiList(data);
    } catch (err) {
      setError(err.message);
      setPegawaiList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadedFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/pegawai/uploaded-files`
      );
      if (!response.ok)
        throw new Error("Gagal mengambil data file yang di upload.");
      const data = await response.json();
      setUploadedFilesList(data);
    } catch (err) {
      setError(err.message);
      setUploadedFilesList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCabang = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cabang`);
      if (!response.ok) throw new Error("Gagal mengambil data cabang.");
      const data = await response.json();
      setCabangList(data);
    } catch (err) {
      console.error("Error fetching cabang:", err);
      setCabangList([]);
    }
  };

  const fetchJabatan = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jabatan`);
      if (!response.ok) throw new Error("Gagal mengambil data jabatan.");
      const data = await response.json();
      setJabatanList(data);
    } catch (err) {
      console.error("Error fetching jabatan:", err);
      setJabatanList([]);
    }
  };

  useEffect(() => {
    fetchPegawai();
    fetchCabang();
    fetchJabatan();
    fetchUploadedFiles();
  }, []);

  const handleAddPegawai = async () => {
    if (
      !newPegawai.namaPegawai ||
      !newPegawai.kodePegawai ||
      !newPegawai.idJabatan ||
      !newPegawai.idCabang
    ) {
      alert("Semua field wajib diisi.");
      return;
    }

    try {
      console.log(newPegawai);
      const response = await fetch(`${API_BASE_URL}/api/pegawai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPegawai),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.title || "Gagal menambahkan pegawai.");
      }

      setNewPegawai({
        namaPegawai: "",
        kodePegawai: "",
        idJabatan: "",
        idCabang: "",
        tanggalMulaiKontrak: "",
        tanggalHabisKontrak: "",
      });
      fetchPegawai();
      alert("Pegawai berhasil ditambahkan!");
    } catch (err) {
      alert(`Error menambahkan pegawai: ${err.message}`);
    }
  };

  const handleAddCabang = async () => {
    if (!newCabangName || !newCabangCode) {
      alert("Nama Cabang dan Kode Cabang tidak boleh kosong.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/cabang`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaCabang: newCabangName,
          kodeCabang: newCabangCode,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.title || "Gagal menambahkan cabang.");
      }
      setNewCabangName("");
      setNewCabangCode("");
      fetchCabang();
      alert("Cabang berhasil ditambahkan!");
    } catch (err) {
      alert(`Error menambahkan cabang: ${err.message}`);
    }
  };

  const handleAddJabatan = async () => {
    if (!newJabatanName) {
      alert("Nama Jabatan tidak boleh kosong.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/jabatan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaJabatan: newJabatanName }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.title || "Gagal menambahkan jabatan.");
      }
      setNewJabatanName("");
      fetchJabatan();
      alert("Jabatan berhasil ditambahkan!");
    } catch (err) {
      alert(`Error menambahkan jabatan: ${err.message}`);
    }
  };

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleUploadExcel = async () => {
    if (!excelFile) {
      alert("Pilih file Excel terlebih dahulu.");
      return;
    }

    const formData = new FormData();
    formData.append("File", excelFile);

    try {
      setUploadMessage("Mengunggah dan memproses file Excel...");
      const response = await fetch(`${API_BASE_URL}/api/pegawai/upload-excel`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Gagal mengunggah file Excel.");
      }
      setUploadMessage(result.message);
      fetchPegawai();
      fetchUploadedFiles();
    } catch (err) {
      setUploadMessage(`Error: ${err.message}`);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }));
  };

  const handleSearchPegawaiDetails = async () => {
    setLoading(true);
    setError(null);
    setInitialSearch(false);
    try {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const queryString = params.toString();
      const response = await fetch(
        `${API_BASE_URL}/api/pegawai/details?${queryString}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gagal mengambil detail pegawai: ${errorText}`);
      }
      const data = await response.json();
      setPegawaiDetailsList(data);
    } catch (err) {
      setError(err.message);
      setPegawaiDetailsList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/pegawai/download-excel`
      );
      if (!response.ok) throw new Error("Gagal mengunduh file Excel.");

      const contentDisposition = response.headers.get("Content-Disposition");
      let fileName = "DataPegawai.xlsx";
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      alert("File Excel berhasil diunduh!");
    } catch (err) {
      alert(`Error mengunduh Excel: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
        isActive
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Sistem Kontrak Pegawai
        </h1>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 space-x-2">
          <TabButton
            id="pegawai"
            label="Data Pegawai"
            isActive={activeTab === "pegawai"}
            onClick={setActiveTab}
          />
          <TabButton
            id="tambah"
            label="Tambah Pegawai"
            isActive={activeTab === "tambah"}
            onClick={setActiveTab}
          />
          <TabButton
            id="master"
            label="Data Master"
            isActive={activeTab === "master"}
            onClick={setActiveTab}
          />
          <TabButton
            id="upload"
            label="Upload Excel"
            isActive={activeTab === "upload"}
            onClick={setActiveTab}
          />
          <TabButton
            id="download"
            label="Download Excel"
            isActive={activeTab === "download"}
            onClick={setActiveTab}
          />
          <TabButton
            id="files"
            label="File History"
            isActive={activeTab === "files"}
            onClick={setActiveTab}
          />
          <TabButton
            id="cari"
            label="Pencarian"
            isActive={activeTab === "cari"}
            onClick={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        {activeTab === "pegawai" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Daftar Pegawai
            </h2>
            {loading && (
              <p className="text-center text-gray-500">Memuat data...</p>
            )}
            {error && (
              <p className="text-center text-red-500">Error: {error}</p>
            )}
            {!loading && pegawaiList.length === 0 && !error && (
              <p className="text-center text-gray-500">
                Tidak ada data pegawai.
              </p>
            )}
            {!loading && pegawaiList.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                        Nama
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                        Kode
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                        Cabang
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                        Jabatan
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                        Mulai
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                        Berakhir
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pegawaiList.map((pegawai) => (
                      <tr
                        key={pegawai.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm">
                          {pegawai.namaPegawai}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {pegawai.kodePegawai}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {pegawai.cabang?.namaCabang} (
                          {pegawai.cabang?.kodeCabang})
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {pegawai.jabatan?.namaJabatan}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(
                            pegawai.tanggalMulaiKontrak
                          ).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(
                            pegawai.tanggalHabisKontrak
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "tambah" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Tambah Pegawai Baru
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddPegawai();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pegawai *
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={newPegawai.namaPegawai}
                  onChange={(e) =>
                    setNewPegawai({
                      ...newPegawai,
                      namaPegawai: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Pegawai *
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={newPegawai.kodePegawai}
                  onChange={(e) =>
                    setNewPegawai({
                      ...newPegawai,
                      kodePegawai: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cabang *
                </label>
                <select
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={newPegawai.idCabang}
                  onChange={(e) =>
                    setNewPegawai({ ...newPegawai, idCabang: e.target.value })
                  }
                >
                  <option value="">Pilih Cabang</option>
                  {cabangList.map((cabang) => (
                    <option key={cabang.id} value={cabang.id}>
                      {cabang.namaCabang} ({cabang.kodeCabang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jabatan *
                </label>
                <select
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={newPegawai.idJabatan}
                  onChange={(e) =>
                    setNewPegawai({ ...newPegawai, idJabatan: e.target.value })
                  }
                >
                  <option value="">Pilih Jabatan</option>
                  {jabatanList.map((jabatan) => (
                    <option key={jabatan.id} value={jabatan.id}>
                      {jabatan.namaJabatan}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai Kontrak
                </label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={newPegawai.tanggalMulaiKontrak}
                  onChange={(e) =>
                    setNewPegawai({
                      ...newPegawai,
                      tanggalMulaiKontrak: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Habis Kontrak
                </label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={newPegawai.tanggalHabisKontrak}
                  onChange={(e) =>
                    setNewPegawai({
                      ...newPegawai,
                      tanggalHabisKontrak: e.target.value,
                    })
                  }
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300"
              >
                Tambah Pegawai
              </button>
            </form>
          </div>
        )}

        {activeTab === "master" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Kelola Data Master
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-600">
                    Tambah Cabang
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nama Cabang"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newCabangName}
                      onChange={(e) => setNewCabangName(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Kode Cabang (JKT)"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newCabangCode}
                      onChange={(e) => setNewCabangCode(e.target.value)}
                    />
                    <button
                      onClick={handleAddCabang}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                    >
                      Tambah Cabang
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-600">
                    Tambah Jabatan
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nama Jabatan"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newJabatanName}
                      onChange={(e) => setNewJabatanName(e.target.value)}
                    />
                    <button
                      onClick={handleAddJabatan}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                    >
                      Tambah Jabatan
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="mt-3 text-sm text-gray-600">
                  {cabangList.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-semibold mb-2 text-gray-700">
                        Daftar Cabang
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 rounded-lg">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">
                                #
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">
                                Nama Cabang
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">
                                Kode Cabang
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {cabangList.map((cabang, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-2 border">
                                  {cabang.namaCabang}
                                </td>
                                <td className="px-4 py-2 border">
                                  {cabang.kodeCabang}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  {jabatanList.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-semibold mb-2 text-gray-700">
                        Daftar Jabatan
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 rounded-lg">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">
                                #
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">
                                Nama Jabatan
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {jabatanList.map((jabatan, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-2 border">
                                  {jabatan.namaJabatan}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "upload" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Upload File Excel
            </h2>
            <div className="space-y-4">
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                onClick={handleUploadExcel}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300"
              >
                Upload & Proses
              </button>
              {uploadMessage && (
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {uploadMessage}
                </p>
              )}
              <div className="text-sm text-gray-500 bg-yellow-50 p-4 rounded-lg">
                <strong>Format Excel:</strong> Nama Pegawai, Kode Pegawai, Nama
                Jabatan, Kode Cabang, Tanggal Mulai Kontrak, Tanggal Habis
                Kontrak, Aksi (CREATE/UPDATE/DELETE).
              </div>
            </div>
          </div>
        )}

        {activeTab === "download" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Unduh Data Pegawai ke Excel
            </h2>
            <p className="text-gray-600 mb-4">
              Klik tombol di bawah untuk mengunduh semua data pegawai dalam
              format file Excel (.xlsx).
            </p>
            <button
              onClick={handleDownloadExcel}
              disabled={downloading}
              className={`w-full font-medium py-3 px-4 rounded-lg transition duration-300 ${
                downloading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700 text-white"
              }`}
            >
              {downloading
                ? "Sedang Mengunduh..."
                : "Unduh Data Pegawai (.xlsx)"}
            </button>
          </div>
        )}

        {activeTab === "files" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Riwayat File Upload
              </h2>
              <button
                onClick={fetchUploadedFiles}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
              >
                Refresh
              </button>
            </div>

            {loading && (
              <p className="text-center text-gray-500">Memuat data file...</p>
            )}

            {error && (
              <p className="text-center text-red-500">Error: {error}</p>
            )}

            {!loading && uploadedFilesList.length === 0 && !error && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📁</div>
                <p className="text-gray-500">Belum ada file yang di-upload.</p>
              </div>
            )}

            {!loading && uploadedFilesList.length > 0 && (
              <div className="space-y-4">
                {uploadedFilesList.map((file, index) => (
                  <div
                    key={file.id || index}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">📄</div>
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {file.fileName ||
                              file.originalFileName ||
                              "File Excel"}
                          </h3>
                          <div className="text-sm text-gray-500 space-y-1">
                            {file.uploadDate && (
                              <p>
                                Tanggal Upload:{" "}
                                {new Date(file.uploadDate).toLocaleString(
                                  "id-ID"
                                )}
                              </p>
                            )}
                            {file.fileSize && (
                              <p>Ukuran: {formatFileSize(file.fileSize)}</p>
                            )}
                            {file.processedRecords !== undefined && (
                              <p>Records Diproses: {file.processedRecords}</p>
                            )}
                            {file.status && (
                              <p>
                                Status:
                                <span
                                  className={`ml-1 px-2 py-1 text-xs rounded-full ${
                                    file.status === "Success"
                                      ? "bg-green-100 text-green-800"
                                      : file.status === "Failed"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {file.status}
                                </span>
                              </p>
                            )}
                            {file.errorMessage && (
                              <p className="text-red-600">
                                Error: {file.errorMessage}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {file.downloadUrl && (
                          <a
                            href={file.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm transition duration-200"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
              <strong>Informasi:</strong> File yang berhasil di-upload akan
              ditampilkan di sini beserta informasi detail seperti tanggal
              upload, ukuran file, dan status pemrosesan.
            </div>
          </div>
        )}
        {activeTab === "cari" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-700">
              Pencarian Detail Pegawai
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Kolom 1 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Pegawai
                    </label>
                    <input
                      type="text"
                      name="namaPegawai"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={searchParams.namaPegawai}
                      onChange={handleSearchChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kode Pegawai
                    </label>
                    <input
                      type="text"
                      name="kodePegawai"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={searchParams.kodePegawai}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>

                {/* Kolom 2 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Cabang
                    </label>
                    <input
                      type="text"
                      name="namaCabang"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={searchParams.namaCabang}
                      onChange={handleSearchChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kode Cabang
                    </label>
                    <input
                      type="text"
                      name="kodeCabang"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={searchParams.kodeCabang}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>

                {/* Kolom 3 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Jabatan
                    </label>
                    <input
                      type="text"
                      name="namaJabatan"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={searchParams.namaJabatan}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Mulai Kontrak
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      name="tanggalMulaiKontrak"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={searchParams.tanggalMulaiKontrak}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Habis Kontrak
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      name="tanggalHabisKontrak"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={searchParams.tanggalHabisKontrak}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSearchPegawaiDetails}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300"
              >
                Cari Data
              </button>
            </div>

            {/* Hasil Pencarian */}
            <div className="mt-8">
              {loading && (
                <p className="text-center text-gray-500">Mencari data...</p>
              )}
              {error && (
                <p className="text-center text-red-500">Error: {error}</p>
              )}

              {!loading &&
                !error &&
                !initialSearch &&
                pegawaiDetailsList.length === 0 && (
                  <p className="text-center text-gray-500 mt-6">
                    Tidak ada hasil ditemukan untuk kriteria yang diberikan.
                  </p>
                )}

              {!loading && !error && initialSearch && (
                <p className="text-center text-gray-500 mt-6">
                  Silakan masukkan kriteria dan klik tombol "Cari Data" untuk
                  memulai.
                </p>
              )}

              {!loading && pegawaiDetailsList.length > 0 && (
                <div className="overflow-x-auto">
                  <h3 className="text-lg font-medium mb-4 text-gray-600">
                    Hasil Pencarian ({pegawaiDetailsList.length} data ditemukan)
                  </h3>
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                          Nama
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                          Kode
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                          Cabang
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                          Jabatan
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                          Mulai
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                          Berakhir
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pegawaiDetailsList.map((detail, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            {detail.namaPegawai}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {detail.kodePegawai}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {detail.namaCabang} ({detail.kodeCabang})
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {detail.namaJabatan}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(
                              detail.tanggalMulaiKontrak
                            ).toLocaleDateString("id-ID")}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(
                              detail.tanggalHabisKontrak
                            ).toLocaleDateString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
