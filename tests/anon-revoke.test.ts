import { describe, expect, it } from 'bun:test'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 匿名クライアント
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

describe('Anon role revoke only (No RLS)', () => {
  describe('Anon role access control', () => {
    it('should block all anon access to tables', async () => {
      // anon keyでのアクセスは全て拒否される
      const tables = [
        'tenants',
        'supporters',
        'users',
        'facilities',
        'plans',
        'slots',
        'consents',
        'inquiries',
        'audits',
      ]

      for (const table of tables) {
        const { data, error } = await supabaseAnon.from(table).select('*').limit(1)

        expect(error).not.toBeNull()
        expect(error?.code).toBe('42501') // permission denied
        expect(data).toBeNull()
      }
    })

    it('should block anon insert/update/delete', async () => {
      // INSERT試行
      const { error: insertError } = await supabaseAnon
        .from('facilities')
        .insert({ id: crypto.randomUUID() })

      expect(insertError).not.toBeNull()
      expect(insertError?.code).toBe('42501')

      // UPDATE試行
      const { error: updateError } = await supabaseAnon
        .from('facilities')
        .update({ updated_at: new Date() })
        .eq('id', 'any-id')

      expect(updateError).not.toBeNull()
      expect(updateError?.code).toBe('42501')

      // DELETE試行
      const { error: deleteError } = await supabaseAnon
        .from('facilities')
        .delete()
        .eq('id', 'any-id')

      expect(deleteError).not.toBeNull()
      expect(deleteError?.code).toBe('42501')
    })

    it('should block anon function calls', async () => {
      // 関数呼び出しも拒否される
      const { error } = await supabaseAnon.rpc('handle_new_user')

      expect(error).not.toBeNull()
      expect(error?.code).toBe('42501')
    })
  })

  describe('Application-level tenant isolation', () => {
    it('demonstrates tenant filtering in application code', async () => {
      // Prismaでの使用例（実際のコードではない）
      const mockPrismaQuery = {
        // すべてのクエリにtenantIdを含める
        findMany: (tenantId: string) => ({
          where: { tenantId },
          // ... other query options
        }),

        create: (data: any, tenantId: string) => ({
          data: { ...data, tenantId },
        }),

        update: (id: string, data: any, tenantId: string) => ({
          where: { id, tenantId }, // 複合条件でテナント分離
          data,
        }),
      }

      // テナントIDは常にアプリケーション側で管理
      const currentTenantId = 'tenant-123'

      // すべてのクエリでテナントIDを指定
      expect(mockPrismaQuery.findMany(currentTenantId).where.tenantId).toBe(currentTenantId)
      expect(mockPrismaQuery.create({}, currentTenantId).data.tenantId).toBe(currentTenantId)
      expect(mockPrismaQuery.update('id', {}, currentTenantId).where.tenantId).toBe(currentTenantId)
    })
  })
})
