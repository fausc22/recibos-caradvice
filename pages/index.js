import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export default function Home() {
  // Estados del formulario
  const [nro, setNro] = useState('000001');
  const [fecha, setFecha] = useState('');
  const [cliente, setCliente] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [doc, setDoc] = useState('');
  const [direccion, setDireccion] = useState('');
  const [concepto, setConcepto] = useState('');
  const [moneda, setMoneda] = useState('ARS');
  const [monto, setMonto] = useState('0');
  const [medio, setMedio] = useState('Efectivo');
  const [detalles, setDetalles] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [vehiculo, setVehiculo] = useState('');

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [connected, setConnected] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const previewRef = useRef(null);

  // Validar campos
  const validateField = (name, value) => {
    switch (name) {
      case 'cliente':
        return value.trim().length >= 3 ? '' : 'Mínimo 3 caracteres';
      case 'monto':
        const num = parseFloat(value);
        return !isNaN(num) && num > 0 ? '' : 'Debe ser mayor a 0';
      case 'doc':
        return !value || value.length >= 7 ? '' : 'DNI/CUIT inválido';
      default:
        return '';
    }
  };

  // Marcar campo como tocado y validar
  const handleBlur = (name, value) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Actualizar valor y validar si ya fue tocado
  const handleChange = (name, value, setter) => {
    setter(value);
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Clase CSS según validación
  const getInputClass = (name, baseClass) => {
    if (!touched[name]) return baseClass;
    if (errors[name]) return `${baseClass} invalid`;
    if (name === 'cliente' || name === 'monto') return `${baseClass} valid`;
    return baseClass;
  };

  // Formatear moneda
  const formatCurrency = (amount, currency) => {
    const formatter = currency === 'USD' 
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
      : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
    return formatter.format(parseFloat(amount) || 0);
  };

  // Formatear fecha DD/MM/YYYY
  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  };

  // Obtener próximo número de recibo
  const fetchNextNumber = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recibosCarAdvice/next-number`);
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        setNro(data.nextNumber);
        setConnected(true);
        showStatus('✓ Conectado correctamente', 'success');
        return data.nextNumber;
      }
      throw new Error(data.error || 'Error desconocido');
    } catch (error) {
      console.error('Error obteniendo número:', error);
      setConnected(false);
      showStatus('Modo sin conexión - Los recibos NO se guardarán en Google Sheets', 'warning');
      
      // Fallback a numeración local
      const localNext = String(Number(localStorage.getItem('ca_next_nro')) || 1).padStart(6, '0');
      setNro(localNext);
      return null;
    }
  };

  // Guardar en Google Sheets
  const saveToSheets = async (payload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recibosCarAdvice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Error al guardar');
      
      console.log('✅ Recibo guardado en Google Sheets');
      return true;
    } catch (error) {
      console.error('Error guardando en Sheets:', error);
      showStatus('ADVERTENCIA: El PDF se descargó pero no se pudo guardar en Google Sheets. Error: ' + error.message, 'error');
      return false;
    }
  };

  // Mostrar mensaje de estado
  const showStatus = (message, type = 'success') => {
    setStatus({ message, type });
    if (type === 'success') {
      setTimeout(() => setStatus({ message: '', type: '' }), 5000);
    }
  };

  // Generar PDF
  const generatePDF = async () => {
    try {
      // Validaciones
      if (!cliente.trim()) {
        showStatus('Por favor ingresa el nombre del cliente', 'error');
        return;
      }

      const montoValue = parseFloat(monto);
      if (!monto || isNaN(montoValue) || montoValue <= 0) {
        showStatus('Por favor ingresa un monto válido mayor a 0', 'error');
        return;
      }

      setLoading(true);

      console.log('🎨 Generando PDF PROFESIONAL con react-pdf...');

      // Importar dinámicamente las librerías de PDF (solo en el cliente)
      const { pdf } = await import('@react-pdf/renderer');
      const ReciboPDFModule = await import('../components/ReciboPDF');
      const ReciboPDF = ReciboPDFModule.default;

      // Preparar datos para el PDF
      const pdfData = {
        nro,
        fecha,
        cliente,
        localidad,
        doc,
        direccion,
        concepto,
        moneda,
        monto,
        medio,
        detalles,
        vendedor,
        vehiculo
      };

      // Generar PDF VECTORIAL profesional
      const blob = await pdf(<ReciboPDF data={pdfData} />).toBlob();
      
      const receiptNumber = (nro || '000001').replace(/[^\d]/g, '').padStart(6, '0');
      
      // Descargar PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recibo_${receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ PDF PROFESIONAL generado: recibo_' + receiptNumber + '.pdf');

      // Guardar en Sheets
      const payload = {
        nro,
        fecha,
        cliente,
        localidad,
        doc,
        direccion,
        concepto,
        moneda,
        monto,
        medio,
        detalles,
        vendedor,
        vehiculo,
        ts: new Date().toISOString()
      };

      const saved = await saveToSheets(payload);

      if (saved) {
        showStatus(`✓ Recibo ${receiptNumber} descargado y guardado correctamente`, 'success');
        
        // Obtener siguiente número
        const nextNum = await fetchNextNumber();
        if (!nextNum) {
          // Fallback local
          const localNext = (Number(localStorage.getItem('ca_next_nro')) || 1) + 1;
          localStorage.setItem('ca_next_nro', String(localNext));
          setNro(String(localNext).padStart(6, '0'));
        }
      } else {
        // Incrementar localmente
        const localNext = (Number(localStorage.getItem('ca_next_nro')) || 1) + 1;
        localStorage.setItem('ca_next_nro', String(localNext));
        setNro(String(localNext).padStart(6, '0'));
      }

    } catch (error) {
      console.error('Error general:', error);
      showStatus('Error al generar el PDF: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Inicialización
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setFecha(today);
    
    showStatus('Conectando con el servidor...', 'warning');
    fetchNextNumber();
  }, []);

  return (
    <div className="min-h-screen p-4 md-p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg-grid-cols-2 gap-4 md-gap-6">
          {/* Formulario */}
          <div className="receipt-card no-print animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/img/iso_negro.png" alt="Car Advice" width={40} height={40} />
              <h2 className="text-xl md-text-2xl font-bold text-[var(--brand)]">
                Generador de Recibos
              </h2>
            </div>

            <button
              onClick={generatePDF}
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: 'rgb(255, 107, 0)',
                color: 'white',
                fontWeight: '600',
                padding: '14px 16px',
                borderRadius: '10px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '15px',
                boxShadow: '0 2px 4px rgba(255, 107, 0, 0.2)',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'rgb(230, 95, 0)')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = 'rgb(255, 107, 0)')}
            >
              {loading ? '⏳ Generando PDF...' : '📥 Descargar PDF'}
            </button>

            {status.message && (
              <div className={`mt-3 p-3 rounded-lg text-sm animate-fade-in ${
                status.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
                status.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
                'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
                {status.message}
              </div>
            )}

            <div className="grid grid-cols-1 md-grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nº de Recibo</label>
                <input
                  type="text"
                  value={nro}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Cliente * {errors.cliente && touched.cliente && <span style={{color: 'rgb(239, 68, 68)', fontSize: '11px'}}>({errors.cliente})</span>}
              </label>
              <input
                type="text"
                value={cliente}
                onChange={(e) => handleChange('cliente', e.target.value, setCliente)}
                onBlur={(e) => handleBlur('cliente', e.target.value)}
                placeholder="Nombre y apellido completo"
                className={getInputClass('cliente', "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm")}
                style={{fontSize: '14px', fontWeight: '400'}}
              />
            </div>

            <div className="grid grid-cols-1 md-grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Localidad</label>
                <input
                  type="text"
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">DNI/CUIT</label>
                <input
                  type="text"
                  value={doc}
                  onChange={(e) => setDoc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div className="receipt-separator my-4"></div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Concepto</label>
              <textarea
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                rows={2}
                placeholder="Se recibió de ____ la suma en concepto de ____"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-vertical"
              />
            </div>

            <div className="grid grid-cols-1 md-grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Moneda</label>
                <select
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Monto * {errors.monto && touched.monto && <span style={{color: 'rgb(239, 68, 68)', fontSize: '11px'}}>({errors.monto})</span>}
                </label>
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => handleChange('monto', e.target.value, setMonto)}
                  onBlur={(e) => handleBlur('monto', e.target.value)}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={getInputClass('monto', "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm")}
                  style={{fontSize: '14px', fontWeight: '500'}}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md-grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Medio de pago</label>
                <select
                  value={medio}
                  onChange={(e) => setMedio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option>Efectivo</option>
                  <option>Transferencia</option>
                  <option>Tarjeta</option>
                  <option>Cheque</option>
                  <option>Pagaré</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Detalles del pago</label>
                <input
                  type="text"
                  value={detalles}
                  onChange={(e) => setDetalles(e.target.value)}
                  placeholder="CBU/Alias, banco, cuotas, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md-grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Vendedor</label>
                <input
                  type="text"
                  value={vendedor}
                  onChange={(e) => setVendedor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Vehículo (opcional)</label>
                <input
                  type="text"
                  value={vehiculo}
                  onChange={(e) => setVehiculo(e.target.value)}
                  placeholder="Marca / Modelo / Año — Patente"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Preview del recibo */}
          <div ref={previewRef} className="receipt-card receipt-preview animate-fade-in" style={{
            backgroundColor: 'rgb(255, 255, 255)',
            minHeight: '1000px',
            padding: '32px'
          }}>
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div className="flex gap-3 items-center">
                <Image 
                  src="/img/logo_recibo.png" 
                  alt="Car Advice" 
                  width={60} 
                  height={60}
                  className="receipt-logo"
                  priority
                />
                <div>
                  <div style={{fontSize: '28px', fontWeight: '800', color: 'rgb(255, 107, 0)', letterSpacing: '-0.5px'}}>
                    CAR ADVICE
                  </div>
                  <div className="receipt-muted" style={{marginTop: '4px'}}>
                    <div style={{fontWeight: '500'}}>Casa Central: Octavio Pinto 3024</div>
                    <div>Suc. Granaderos: Bv. Granaderos 3110</div>
                    <div>Suc. Caraffa: Av. Caraffa 2883</div>
                    <div style={{fontWeight: '500', color: 'rgb(255, 107, 0)'}}>☎ 351-515-8848</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div style={{fontSize: '16px', fontWeight: '700', color: 'rgb(255, 107, 0)', marginBottom: '4px'}}>
                  RECIBO
                </div>
                <div className="receipt-muted" style={{fontSize: '11px'}}>Nº</div>
                <div className="receipt-amount" style={{fontSize: '28px', fontWeight: '800', color: 'rgb(0, 0, 0)'}}>
                  {nro || '000001'}
                </div>
                <div className="receipt-muted" style={{marginTop: '4px', fontWeight: '500'}}>
                  Fecha: {formatDate(fecha)}
                </div>
              </div>
            </div>

            <div className="receipt-separator"></div>

            <div className="grid grid-cols-2 gap-3" style={{fontSize: '14px', lineHeight: '1.6'}}>
              <div>
                <b style={{color: 'rgb(255, 107, 0)', fontWeight: '600'}}>Recibí de:</b> 
                <span style={{marginLeft: '4px', fontWeight: '500', color: 'rgb(0, 0, 0)'}}>{cliente || '__________'}</span>
              </div>
              <div>
                <b style={{color: 'rgb(255, 107, 0)', fontWeight: '600'}}>Localidad:</b> 
                <span style={{marginLeft: '4px', color: 'rgb(0, 0, 0)'}}>{localidad || '__________'}</span>
              </div>
              <div>
                <b style={{color: 'rgb(255, 107, 0)', fontWeight: '600'}}>Dirección:</b> 
                <span style={{marginLeft: '4px', color: 'rgb(0, 0, 0)'}}>{direccion || '__________'}</span>
              </div>
              <div>
                <b style={{color: 'rgb(255, 107, 0)', fontWeight: '600'}}>DNI/CUIT:</b> 
                <span style={{marginLeft: '4px', color: 'rgb(0, 0, 0)'}}>{doc || '__________'}</span>
              </div>
            </div>

            <div className="receipt-separator"></div>

            <div style={{fontSize: '14px', lineHeight: '1.6'}}>
              <b style={{color: 'rgb(255, 107, 0)', fontWeight: '600'}}>Concepto:</b> 
              <span style={{marginLeft: '4px', color: 'rgb(0, 0, 0)'}}>{concepto || '__________'}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgb(255, 247, 237)',
              border: '2px solid rgb(255, 107, 0)',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '12px',
              marginBottom: '12px'
            }}>
              <div style={{fontSize: '14px', fontWeight: '600', color: 'rgb(255, 107, 0)'}}>
                IMPORTE TOTAL
              </div>
              <div style={{fontSize: '32px', fontWeight: '800', color: 'rgb(255, 107, 0)', letterSpacing: '-1px'}}>
                {formatCurrency(monto, moneda)}
              </div>
            </div>

            <div className="receipt-separator"></div>

            <div className="grid grid-cols-2 gap-4" style={{fontSize: '14px'}}>
              <div>
                <b style={{color: 'rgb(255, 107, 0)', fontWeight: '600', display: 'block', marginBottom: '4px'}}>
                  Medio de pago
                </b>
                <span style={{color: 'rgb(0, 0, 0)', fontWeight: '500'}}>{medio}</span>
              </div>
              <div>
                <b style={{color: 'rgb(255, 107, 0)', fontWeight: '600', display: 'block', marginBottom: '4px'}}>
                  Detalles
                </b>
                <span style={{color: 'rgb(0, 0, 0)'}}>{detalles || '-'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3" style={{fontSize: '14px'}}>
              <div>
                <b style={{color: 'rgb(255, 107, 0)', fontWeight: '600', display: 'block', marginBottom: '4px'}}>
                  Vendedor
                </b>
                <span style={{color: 'rgb(0, 0, 0)'}}>{vendedor || '-'}</span>
              </div>
              <div>
                <b style={{color: 'rgb(255, 107, 0)', fontWeight: '600', display: 'block', marginBottom: '4px'}}>
                  Vehículo
                </b>
                <span style={{color: 'rgb(0, 0, 0)'}}>{vehiculo || '-'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4" style={{marginTop: '48px'}}>
              <div style={{
                height: '64px',
                borderTop: '2px solid rgb(0, 0, 0)',
                paddingTop: '8px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '500',
                color: 'rgb(100, 100, 100)'
              }}>
                Firma del cliente
              </div>
              <div style={{
                height: '64px',
                borderTop: '2px solid rgb(0, 0, 0)',
                paddingTop: '8px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '500',
                color: 'rgb(100, 100, 100)'
              }}>
                Firma / Sello Car Advice — Tesorería
              </div>
            </div>

            <div className="text-center" style={{marginTop: '24px'}}>
              <Image 
                src="/img/iso_negro.png" 
                alt="Car Advice" 
                width={70} 
                height={70}
                className="mx-auto"
                style={{opacity: '0.8'}}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}