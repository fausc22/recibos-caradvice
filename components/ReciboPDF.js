import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Estilos profesionales para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: 4,
    borderBottomColor: '#FF6B00',
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 70,
    height: 70,
    marginRight: 12,
  },
  companyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.4,
  },
  companyDetailBold: {
    fontSize: 10,
    color: '#666666',
    fontWeight: 'bold',
  },
  headerRight: {
    alignItems: 'flex-end',
    minWidth: 120,
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 2,
  },
  receiptNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 4,
  },
  receiptDate: {
    fontSize: 10,
    color: '#666666',
    marginTop: 4,
  },
  separator: {
    height: 2,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  infoSection: {
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  infoItem: {
    width: '50%',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    color: '#000000',
  },
  conceptSection: {
    marginVertical: 12,
  },
  conceptLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 4,
  },
  conceptValue: {
    fontSize: 11,
    color: '#000000',
    lineHeight: 1.4,
  },
  amountBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#FF6B00',
    borderRadius: 8,
    padding: 15,
    marginVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  amountValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  detailItem: {
    width: '50%',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 11,
    color: '#000000',
  },
  signaturesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 60,
    marginBottom: 20,
  },
  signatureBox: {
    width: '48%',
    borderTopWidth: 2,
    borderTopColor: '#000000',
    paddingTop: 8,
    alignItems: 'center',
  },
  signatureText: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 20,
  },
  footerLogo: {
    width: 60,
    height: 60,
    opacity: 0.5,
  },
});

const ReciboPDF = ({ data }) => {
  const formatCurrency = (amount, currency) => {
    const num = parseFloat(amount) || 0;
    if (currency === 'USD') {
      return `US$ ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$ ${num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image 
              src="/img/logo_recibo.png" 
              style={styles.logo}
            />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>CAR ADVICE</Text>
              <Text style={styles.companyDetailBold}>Casa Central: Octavio Pinto 3024</Text>
              <Text style={styles.companyDetails}>Suc. Granaderos: Bv. Granaderos 3110</Text>
              <Text style={styles.companyDetails}>Suc. Caraffa: Av. Caraffa 2883</Text>
              <Text style={styles.companyDetailBold}>☎ 351-515-8848</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.receiptTitle}>RECIBO</Text>
            <Text style={{fontSize: 9, color: '#666666'}}>Nº</Text>
            <Text style={styles.receiptNumber}>{data.nro || '000001'}</Text>
            <Text style={styles.receiptDate}>Fecha: {formatDate(data.fecha)}</Text>
          </View>
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Client Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Recibí de:</Text>
              <Text style={styles.infoValue}>{data.cliente || '__________'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Localidad:</Text>
              <Text style={styles.infoValue}>{data.localidad || '__________'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Dirección:</Text>
              <Text style={styles.infoValue}>{data.direccion || '__________'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>DNI/CUIT:</Text>
              <Text style={styles.infoValue}>{data.doc || '__________'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Concept */}
        <View style={styles.conceptSection}>
          <Text style={styles.conceptLabel}>Concepto:</Text>
          <Text style={styles.conceptValue}>{data.concepto || '__________'}</Text>
        </View>

        {/* Amount Box */}
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>IMPORTE TOTAL</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(data.monto, data.moneda)}
          </Text>
        </View>

        <View style={styles.separator} />

        {/* Payment Details */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Medio de pago</Text>
            <Text style={styles.detailValue}>{data.medio || '-'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Detalles</Text>
            <Text style={styles.detailValue}>{data.detalles || '-'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Vendedor</Text>
            <Text style={styles.detailValue}>{data.vendedor || '-'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Vehículo</Text>
            <Text style={styles.detailValue}>{data.vehiculo || '-'}</Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signaturesSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureText}>Firma del cliente</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureText}>Firma / Sello Car Advice — Tesorería</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Image 
            src="/img/iso_negro.png" 
            style={styles.footerLogo}
          />
        </View>
      </Page>
    </Document>
  );
};

export default ReciboPDF;

