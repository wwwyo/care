-- =====================================================
-- anonロール権限剥奪 + アプリケーション側テナントID指定のRLS
-- =====================================================

-- anonロールから全権限を剥奪
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- 将来作成されるオブジェクトへのデフォルト権限も剥奪
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon;

-- =====================================================
-- RLS有効化（アプリケーションがテナントIDを指定）
-- =====================================================

-- テナント関連の主要テーブルのみRLS有効化
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE supporter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- シンプルなRLSポリシー（app.current_tenant_idを使用）
-- =====================================================

-- tenants: アプリケーションが設定したテナントIDと一致
CREATE POLICY "tenant_app_isolation" ON tenants
  FOR ALL USING (
    id = current_setting('app.current_tenant_id')::uuid
  );

-- supporters: アプリケーションが設定したテナントIDと一致
CREATE POLICY "supporter_app_tenant_isolation" ON supporters
  FOR ALL USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
  );

CREATE POLICY "supporter_profile_app_tenant_isolation" ON supporter_profiles
  FOR ALL USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
  );

-- plans: アプリケーションが設定したテナントIDと一致
CREATE POLICY "plan_app_tenant_isolation" ON plans
  FOR ALL USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
  );
