import { supabase } from './supabase'
import { useToast } from '@/hooks/use-toast'

export interface SimpleMigrationResult {
    success: boolean
    message: string
    counts: {
        products: number
        customers: number
        orders: number
    }
}

export const simpleMigrateFromLocalStorage = async (): Promise<SimpleMigrationResult> => {
    const result: SimpleMigrationResult = {
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
                console.log(`Migrating ${products.length} products...`)

                for (const product of products) {
                    try {
                        const productData = {
                            name: product.name || 'Unknown Product',
                            description: product.description || '',
                            sku: product.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                            barcode: product.barcode || '',
                            category: product.category || 'Uncategorized',
                            unit_price: parseFloat(product.unitPrice || product.price || '0'),
                            current_stock: parseInt(product.currentStock || product.stock || '0'),
                            min_stock: parseInt(product.minStock || '0'),
                            track_inventory: product.trackInventory !== false,
                            images: product.images || [],
                            hsn_code: product.hsnCode || '8517'
                        }

                        const { error } = await supabase
                            .from('products')
                            .insert([productData])

                        if (!error) {
                            result.counts.products++
                        } else {
                            console.log('Product insert error (may be duplicate):', error.message)
                        }
                    } catch (err) {
                        console.log('Product insert failed:', err)
                    }
                }
            }
        }

        // Migrate customers
        const customersRaw = localStorage.getItem('app_customers')
        if (customersRaw) {
            const customers = JSON.parse(customersRaw)
            if (Array.isArray(customers) && customers.length > 0) {
                console.log(`Migrating ${customers.length} customers...`)

                for (const customer of customers) {
                    try {
                        const customerData = {
                            name: customer.name || 'Unknown Customer',
                            phone: customer.phone || `temp-phone-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                            email: customer.email || '',
                            address: customer.address || '',
                            gst_number: customer.gstNumber || '',
                            total_purchases: parseInt(customer.totalPurchases || '0'),
                            total_spent: parseFloat(customer.totalSpent || '0'),
                            last_purchase: customer.lastPurchase || new Date().toISOString(),
                            join_date: customer.joinDate || new Date().toISOString(),
                            loyalty_points: parseInt(customer.loyaltyPoints || '0')
                        }

                        const { error } = await supabase
                            .from('customers')
                            .insert([customerData])

                        if (!error) {
                            result.counts.customers++
                        } else {
                            console.log('Customer insert error (may be duplicate):', error.message)
                        }
                    } catch (err) {
                        console.log('Customer insert failed:', err)
                    }
                }
            }
        }

        // Migrate orders
        const ordersRaw = localStorage.getItem('pos_orders')
        if (ordersRaw) {
            const orders = JSON.parse(ordersRaw)
            if (Array.isArray(orders) && orders.length > 0) {
                console.log(`Migrating ${orders.length} orders...`)

                // Get all customers to map customer data
                const { data: customers } = await supabase
                    .from('customers')
                    .select('id, phone, name')

                const customerMap = new Map()
                customers?.forEach(c => {
                    customerMap.set(c.phone, c.id)
                    customerMap.set(c.name, c.id)
                })

                for (const order of orders) {
                    try {
                        const orderData = {
                            customer_id: order.customer ?
                                (customerMap.get(order.customer.phone) || customerMap.get(order.customer.name)) :
                                null,
                            items: (order.items || []).map((item: any) => ({
                                product_id: '', // We'll need to map this based on product name/SKU
                                product_name: item.name || 'Unknown Product',
                                quantity: parseInt(item.quantity || '1'),
                                price: parseFloat(item.price || '0'),
                                total: parseFloat(item.price || '0') * parseInt(item.quantity || '1')
                            })),
                            subtotal: parseFloat(order.subtotal || '0'),
                            discount_percent: parseFloat(order.discountPercent || '0'),
                            discount_amount: parseFloat(order.discountAmount || '0'),
                            tax_rate: parseFloat(order.taxRate || '18'),
                            tax_amount: parseFloat(order.taxAmount || '0'),
                            total: parseFloat(order.total || '0'),
                            payment_method: order.paymentMethod || 'Cash',
                            payment_details: order.paymentDetails || null,
                            created_at: order.createdAt || new Date().toISOString()
                        }

                        const { error } = await supabase
                            .from('orders')
                            .insert([orderData])

                        if (!error) {
                            result.counts.orders++
                        } else {
                            console.log('Order insert error:', error.message)
                        }
                    } catch (err) {
                        console.log('Order insert failed:', err)
                    }
                }
            }
        }

        result.message = `Migration completed! Successfully migrated ${result.counts.products} products, ${result.counts.customers} customers, and ${result.counts.orders} orders.`

    } catch (error) {
        result.success = false
        result.message = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    return result
}

