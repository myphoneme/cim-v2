
import { Equipment } from './types';

export const DC_EQUIPMENT: Equipment[] = [
  { 
    id: '1', name: 'Server Load Balancer', area: 'Network', type: 'SLB', vendor: 'Array', model: 'AVX 7900', qty: 2, sopStatus: 'Available',
    email: 'tacsupport@arraynetworks.net', phone: '1800 572 7729', licenseApplicable: 'Yes', 
    contactInfo: 'Mr. Vishal Lokhade', contactNumber: '8169172597',
    attachments: []
  },
  { 
    id: '2', name: 'Web Application Firewall', area: 'Security', type: 'WAF', vendor: 'Array', model: 'AVX 7900', qty: 2, sopStatus: 'Available',
    email: 'tacsupport@arraynetworks.net', phone: '1800 572 7729', licenseApplicable: 'Yes',
    attachments: []
  },
  { 
    id: '9', name: 'Primary & Secondary Firewall', area: 'Security', type: 'Firewall', vendor: 'FortiNet', model: 'FortiGate-1001F', qty: 2, sopStatus: 'Available',
    email: 'cs@fortinet.com', phone: '0008000503635', licenseApplicable: 'Yes', webSupport: 'https://support.fortinet.com',
    userName: 'fsl.network@starnextinnovations.com', credentials: 'DFSL@2025mh@#', otpRequired: 'Yes (on Email / Mr. Prayag)',
    validity: '08-Jul-30',
    attachments: []
  },
  { 
    id: '17', name: 'POE Switch', area: 'Network', type: 'Switch', vendor: 'Netgear', model: 'GS724TPv3', qty: 57, sopStatus: 'Available',
    email: 'support@netgearstore.in', phone: '1800 419 4543', licenseApplicable: 'No', 
    webSupport: 'https://accounts2.netgear.com/login', validity: '12-Oct-26', contactInfo: 'Mr. Devendra', contactNumber: '+91 95520 10788',
    attachments: []
  },
  { 
    id: '20', name: 'Blade Server', area: 'Comput', type: 'Server', vendor: 'Dell', model: 'PowerEdge MX750c', qty: 19, sopStatus: 'Available',
    licenseApplicable: 'No', webSupport: 'https://www.dell.com/support/home/en-in', validity: '14-May-30', contactNumber: '7795889140',
    attachments: []
  },
  { 
    id: '23', name: 'Unified Storage', area: 'Comput', type: 'Storage', vendor: 'NetApp', model: 'FAS 8700', qty: 17, sopStatus: 'Available',
    email: 'Support@netapp.com', phone: '8001008948', licenseApplicable: 'No', webSupport: 'https://mysupport.netapp.com',
    validity: '14-May-30',
    attachments: []
  },
  { 
    id: '26', name: 'Server Virtualization', area: 'Application', type: 'Virtualization', vendor: 'broadcom', model: 'EsXi 8.03e', qty: 'N/A', sopStatus: 'Available',
    email: 'support@broadcom.com', phone: '8040440000', licenseApplicable: 'Yes', webSupport: 'https://access.broadcom.com',
    validity: 'Pending OEM Response', contactInfo: 'Mr. Ajay', contactNumber: '9881224148',
    attachments: []
  }
];
