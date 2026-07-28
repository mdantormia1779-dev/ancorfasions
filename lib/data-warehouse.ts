import { createClient } from '@supabase/supabase-js';

// Types for Data Warehouse Dimension Tables
export interface DimDate {
  date_key: number;
  full_date: string;
  day_of_week: number;
  day_name: string;
  day_of_month: number;
  day_of_year: number;
  week_of_year: number;
  month_number: number;
  month_name: string;
  quarter: number;
  year: number;
  is_weekend: boolean;
  is_holiday: boolean;
}

export interface DimCustomer {
  customer_sk: string;
  customer_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  segment?: string;
  lifetime_value?: number;
  acquisition_date?: string;
  valid_from?: string;
  valid_to?: string;
  is_current?: boolean;
}

export interface DimProduct {
  product_sk: string;
  product_id: string;
  sku: string;
  name: string;
  category_id?: string;
  category_name?: string;
  brand_id?: string;
  brand_name?: string;
  color?: string;
  size?: string;
  cost_price?: number;
  retail_price?: number;
  valid_from?: string;
  valid_to?: string;
  is_current?: boolean;
}

// Types for Data Warehouse Fact Tables
export interface FactSales {
  sales_id: string;
  date_key: number;
  customer_sk: string;
  product_sk: string;
  campaign_sk?: string;
  location_sk?: string;
  order_id: string;
  quantity: number;
  unit_price: number;
  gross_revenue: number;
  discount_amount: number;
  tax_amount: number;
  net_revenue: number;
  cogs: number;
  gross_profit: number;
  created_at?: string;
}

/**
 * Enterprise Data Warehouse Service
 * Centralizes queries directed towards the Data Warehouse Star Schema.
 */
export class DataWarehouseService {
  private supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  private supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  private supabase = createClient(this.supabaseUrl, this.supabaseServiceKey);

  /**
   * Retrieves high-level revenue metrics for a specific date range.
   */
  async getRevenueSummary(startDateKey: number, endDateKey: number) {
    const { data, error } = await this.supabase
      .from('fact_sales')
      .select('gross_revenue, net_revenue, gross_profit')
      .gte('date_key', startDateKey)
      .lte('date_key', endDateKey);

    if (error) {
      console.error('Data Warehouse Query Failed:', error);
      throw error;
    }

    return data.reduce(
      (acc, curr) => ({
        totalGrossRevenue: acc.totalGrossRevenue + Number(curr.gross_revenue),
        totalNetRevenue: acc.totalNetRevenue + Number(curr.net_revenue),
        totalGrossProfit: acc.totalGrossProfit + Number(curr.gross_profit),
      }),
      { totalGrossRevenue: 0, totalNetRevenue: 0, totalGrossProfit: 0 }
    );
  }

  /**
   * Inserts a batch of sales facts from the ETL pipeline.
   */
  async loadFactSales(salesBatch: Omit<FactSales, 'sales_id' | 'created_at'>[]) {
    const { error } = await this.supabase.from('fact_sales').insert(salesBatch);
    if (error) {
      throw new Error(`Failed to load sales facts: ${error.message}`);
    }
  }
}

export const dataWarehouseService = new DataWarehouseService();
