import type { Customer } from '../types/invoice'

export const customers = {
  northwind: {
    id: 'northwind',
    name: 'Northwind Traders',
    contact: 'Accounts Payable',
    addressLines: ['500 Pine Street', 'Portland, OR 97204'],
    email: 'ap@northwind.example',
  },
  contoso: {
    id: 'contoso',
    name: 'Contoso Ltd',
    contact: 'Finance Team',
    addressLines: ['1 Contoso Way', 'Redmond, WA 98052'],
    email: 'finance@contoso.example',
  },
  fabrikam: {
    id: 'fabrikam',
    name: 'Fabrikam Inc.',
    contact: 'Accounts Payable',
    addressLines: ['88 Harbor Road', 'Seattle, WA 98101'],
    email: 'ap@fabrikam.example',
  },
  tailspin: {
    id: 'tailspin',
    name: 'Tailspin Toys',
    contact: 'Purchasing',
    addressLines: ['42 Toy Lane', 'Austin, TX 78701'],
    email: 'purchasing@tailspin.example',
  },
  adventureWorks: {
    id: 'adventure-works',
    name: 'Adventure Works',
    contact: 'Billing Department',
    addressLines: ['9 Summit Avenue', 'Denver, CO 80202'],
    email: 'billing@adventureworks.example',
  },
  wideWorld: {
    id: 'wide-world',
    name: 'Wide World Importers',
    contact: 'Accounts Payable',
    addressLines: ['300 Dock Street', 'Boston, MA 02110'],
    email: 'ap@wideworld.example',
  },
  blueYonder: {
    id: 'blue-yonder',
    name: 'Blue Yonder Airlines',
    contact: 'Vendor Payments',
    addressLines: ['7 Runway Drive', 'Chicago, IL 60666'],
    email: 'vendors@blueyonder.example',
  },
} satisfies Record<string, Customer>
