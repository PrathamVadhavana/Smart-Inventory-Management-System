import { supabase, Product, Customer, Order } from './supabase'
import { useToast } from '@/hooks/use-toast'

export interface MigrationResult {
  success: boolean
  message: string
  counts: {
    products: number
    customers: number
    orders: number
  }
}

export const migrateFromLocalStorage = async (): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: true,
    message: '',
    counts: {
      products: 0,
      customers: 0,
      orders: 0
    }
  }

  try {
    // Migrate products
    const productsRaw = localStorage.getItem('dashboard_products')
    if (productsRaw) {
      const products = JSON.parse(productsRaw)
      if (Array.isArray(products) && products.length > 0) {
        const productData = products.map((p: any, index: number) => ({
          name: p.name || 'Unknown Product',
          description: p.description || '',
          sku: p.sku || `SKU-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 6)}`,
          barcode: p.barcode || '',
          category: p.category || 'Uncategorized',
          unit_price: parseFloat(p.unitPrice || p.price || '0'),
          current_stock: parseInt(p.currentStock || p.stock || '0'),
          min_stock: parseInt(p.minStock || '0'),
          track_inventory: p.trackInventory !== false,
          images: p.images || [],
          hsn_code: p.hsnCode || '8517'
        }))

        // First try to insert, if that fails due to duplicates, handle gracefully
        let productsError = null
        try {
          const { error } = await supabase
            .from('products')
            .insert(productData)
          productsError = error
        } catch (err) {
          // If insert fails due to unique constraint, try individual inserts
          console.log('Bulk insert failed, trying individual inserts...')
          for (const product of productData) {
            try {
              const { error } = await supabase
                .from('products')
                .insert([product])
              if (error && !error.message.includes('duplicate key')) {
                console.error('Error inserting product:', error)
              }
            } catch (individualError) {
              console.log('Product already exists or other error:', individualError)
            }
          }
        }

        if (productsError) {
          console.error('Error migrating products:', productsError)
          result.success = false
          result.message += `Failed to migrate products: ${productsError.message}. `
        } else {
          result.counts.products = products.length
        }
      }
    }

    // Migrate customers
    const customersRaw = localStorage.getItem('app_customers')
    if (customersRaw) {
      const customers = JSON.parse(customersRaw)
      if (Array.isArray(customers) && customers.length > 0) {
        const customerData = customers.map((c: any, index: number) => ({
          name: c.name || 'Unknown Customer',
          phone: c.phone || `temp-phone-${index}-${Date.now()}`, // Ensure unique phone
          email: c.email || '',
          address: c.address || '',
          gst_number: c.gstNumber || '',
          total_purchases: parseInt(c.totalPurchases || '0'),
          total_spent: parseFloat(c.totalSpent || '0'),
          last_purchase: c.lastPurchase || new Date().toISOString(),
          join_date: c.joinDate || new Date().toISOString(),
          loyalty_points: parseInt(c.loyaltyPoints || '0')
        }))

        // First try to insert, if that fails due to duplicates, handle gracefully
        let customersError = null
        try {
          const { error } = await supabase
            .from('customers')
            .insert(customerData)
          customersError = error
        } catch (err) {
          // If insert fails due to unique constraint, try individual inserts
          console.log('Bulk insert failed, trying individual inserts...')
          for (const customer of customerData) {
            try {
              const { error } = await supabase
                .from('customers')
                .insert([customer])
              if (error && !error.message.includes('duplicate key')) {
                console.error('Error inserting customer:', error)
              }
            } catch (individualError) {
              console.log('Customer already exists or other error:', individualError)
            }
          }
        }

        if (customersError) {
          console.error('Error migrating customers:', customersError)
          result.success = false
          result.message += `Failed to migrate customers: ${customersError.message}. `
        } else {
          result.counts.customers = customers.length
        }
      }
    }

    // Migrate orders
    const ordersRaw = localStorage.getItem('pos_orders')
    if (ordersRaw) {
      const orders = JSON.parse(ordersRaw)
      if (Array.isArray(orders) && orders.length > 0) {
        // First, get all customers to map customer data
        const { data: customers } = await supabase
          .from('customers')
          .select('id, phone, name')

        const customerMap = new Map()
        customers?.forEach(c => {
          customerMap.set(c.phone, c.id)
          customerMap.set(c.name, c.id)
        })

        const orderData = orders.map((o: any) => ({
          customer_id: o.customer ?
            (customerMap.get(o.customer.phone) || customerMap.get(o.customer.name)) :
            null,
          items: (o.items || []).map((item: any) => ({
            product_id: '', // We'll need to map this based on product name/SKU
            product_name: item.name || 'Unknown Product',
            quantity: parseInt(item.quantity || '1'),
            price: parseFloat(item.price || '0'),
            total: parseFloat(item.price || '0') * parseInt(item.quantity || '1')
          })),
          subtotal: parseFloat(o.subtotal || '0'),
          discount_percent: parseFloat(o.discountPercent || '0'),
          discount_amount: parseFloat(o.discountAmount || '0'),
          tax_rate: parseFloat(o.taxRate || '18'),
          tax_amount: parseFloat(o.taxAmount || '0'),
          total: parseFloat(o.total || '0'),
          payment_method: o.paymentMethod || 'Cash',
          payment_details: o.paymentDetails || null,
          created_at: o.createdAt || new Date().toISOString()
        }))

        const { error: ordersError } = await supabase
          .from('orders')
          .insert(orderData)

        if (ordersError) {
          console.error('Error migrating orders:', ordersError)
          result.success = false
          result.message += `Failed to migrate orders: ${ordersError.message}. `
        } else {
          result.counts.orders = orders.length
        }
      }
    }

    if (result.success) {
      result.message = `Migration completed successfully! Migrated ${result.counts.products} products, ${result.counts.customers} customers, and ${result.counts.orders} orders.`
    }

  } catch (error) {
    result.success = false
    result.message = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
  }

  return result
}

export const clearLocalStorage = () => {
  const keysToRemove = [
    'dashboard_products',
    'app_customers',
    'pos_orders',
    'recent_activity'
  ]

  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
  })
}

export const backupLocalStorage = () => {
  const backup = {
    products: localStorage.getItem('dashboard_products'),
    customers: localStorage.getItem('app_customers'),
    orders: localStorage.getItem('pos_orders'),
    activities: localStorage.getItem('recent_activity'),
    timestamp: new Date().toISOString()
  }

  const backupData = JSON.stringify(backup, null, 2)
  const blob = new Blob([backupData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `localStorage-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

