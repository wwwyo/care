-- =============================================================================
-- 中野区オープンデータ 福祉施設情報インポート
-- =============================================================================
-- 生成日時: 2025-08-17
-- データソース: 中野区オープンデータ
-- 対象テーブル: facilities, facility_profiles, facility_locations, facility_contacts, facility_services
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. すこやか福祉センター (Support Centers)
-- =============================================================================

DO $$
DECLARE
  facility_uuid UUID;
BEGIN
  -- 中部すこやか福祉センター
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '中部すこやか福祉センター', NULL, 'その他', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '中央3丁目19番1号', 35.7003729695231, 139.67420678233, NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3367-7788', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'その他', NOW());

  -- 北部すこやか福祉センター
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '北部すこやか福祉センター', NULL, 'その他', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '江古田4丁目31番10号', 35.7246492439286, 139.661481744202, NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3389-4323', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'その他', NOW());

  -- 南部すこやか福祉センター
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '南部すこやか福祉センター', NULL, 'その他', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '弥生町5丁目11番26号', 35.6881107502144, 139.66850453217, NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3380-5551', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'その他', NOW());

  -- 鷺宮すこやか福祉センター
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '鷺宮すこやか福祉センター', NULL, 'その他', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '若宮3丁目58番10号', 35.7220213652961, 139.640059862906, NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3336-7111', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'その他', NOW());
END $$;

-- =============================================================================
-- 2. 入所施設 (Residential Facilities)
-- =============================================================================

DO $$
DECLARE
  facility_uuid UUID;
BEGIN
  -- 障害者支援施設江古田の森
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '障害者支援施設江古田の森', NULL, '施設入所支援', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '江古田3-14-19', 35.7296724351044, 139.66539139332, NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, fax, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-5318-3711', '03-5318-3712', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, '施設入所支援', NOW());

  -- メイプルガーデン
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, 'メイプルガーデン', NULL, '施設入所支援', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '中野五丁目26番18号', 35.7089825182348, 139.668811166109, NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, fax, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3387-0082', '03-3387-0820', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, '施設入所支援', NOW());

  -- 中野江原短期入所
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '中野江原短期入所', NULL, '短期入所', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '江原町三丁目23番2号', 35.7327203186343, 139.673990075078, NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-5988-7619', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, '短期入所', NOW());
END $$;

-- =============================================================================
-- 3. 日中活動_通所施設 (Day Activity Facilities)
-- =============================================================================

DO $$
DECLARE
  facility_uuid UUID;
BEGIN
  -- 中野区東部福祉作業センター
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '中野区東部福祉作業センター', 'なかのくとうぶふくしさぎょうせんたー', '生活介護', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '中央二丁目22番10号101', 35.7008192144357, 139.680953834181, NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, fax, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3366-2940', '03-3366-2945', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, '生活介護', NOW());

  -- あとりえふぁんとむ
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, 'あとりえふぁんとむ', 'あとりえふぁんとむ', '就労継続支援B型', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '東中野四丁目2番2号篠木ビル2･3階', 35.7065371930994, 139.685578982528, NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, fax, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3360-3517', '03-3360-3587', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, '生活介護', NOW());

  -- すばるカンパニー
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, 'すばるカンパニー', 'すばるかんぱにー', '就労継続支援B型', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '若宮一丁目54番15号', 35.7199904524076, 139.650499976286, NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, fax, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3339-6541', '03-3339-3811', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, '生活介護', NOW());

  -- コロニー中野
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, 'コロニー中野', 'ころにーなかの', '就労継続支援B型', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '江原町二丁目6番7号', 35.729114956335, 139.668302387919, NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, fax, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3953-3541', '03-3565-0471', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, '生活介護', NOW());

  -- 杉の子城山
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '杉の子城山', 'すぎのこしろやま', '生活介護', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '中野一丁目6番12号', 35.7071825125643, 139.672499933839, NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, fax, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3366-0066', '03-3366-7662', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, '生活介護', NOW());

  -- 杉の子大和
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '杉の子大和', 'すぎのこやまと', '生活介護', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '大和町三丁目18番2号', 35.7197609833024, 139.658949871695, NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, fax, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3339-6541', '03-3339-6542', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, '生活介護', NOW());
END $$;

-- =============================================================================
-- 4. 障害児通所支援施設 (Children's Support Facilities)
-- =============================================================================

DO $$
DECLARE
  facility_uuid UUID;
BEGIN
  -- 療育センターアポロ園
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '療育センターアポロ園', 'リョウイクセンターアポロエン', '児童発達支援', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, access_info, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '江古田4-43-25', 35.7253184293397, 139.659472384704, 
          '中野駅北口からバス-練馬駅行き「江古田4丁目」より徒歩3分西武新宿線沼袋駅又は野方駅から徒歩15分', NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3389-3700', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, '児童発達支援', NOW());

  -- 子ども発達センターたんぽぽ
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '子ども発達センターたんぽぽ', 'ジュウド・チョウフクショウガイジツウショシエンシセツ', '児童発達支援', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, access_info, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '丸山1-17-2', 35.7255903461187, 139.657766184262,
          '中野駅北口からバス-練馬駅行き「江古田4丁目」より徒歩5分西武新宿線沼袋駅又は野方駅から徒歩15分', NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-5943-7883', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, '児童発達支援', NOW());

  -- 放課後ディサービスセンターみずいろ
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '放課後ディサービスセンターみずいろ', 'チテキ・ハッタツトウショウガイジツウショシエンシセツ', '放課後等デイサービス', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, access_info, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '丸山1-17-2', 35.7255903461187, 139.657766184262,
          '中野駅北口からバス-練馬駅行き「江古田4丁目」より徒歩5分西武新宿線沼袋駅又は野方駅から徒歩15分', NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3388-5777', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, '児童発達支援', NOW());

  -- 療育センターゆめなりあ
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '療育センターゆめなりあ', 'ナンブショウガイジツウショシエンシセツ', '児童発達支援', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, access_info, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '弥生町5-5-2', 35.6861567510087, 139.666354101205,
          '中野駅南口からバス-新宿西口または渋谷駅行き「南台交差点」より徒歩5分・南部高齢者会館行き「南台図書館」より徒歩1分、地下鉄丸の内線「中野富士見町駅」より徒歩10分', NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-6382-4781', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, '児童発達支援', NOW());
END $$;

-- =============================================================================
-- 5. 障害者支援施設 (Disability Support Facilities)
-- =============================================================================

DO $$
DECLARE
  facility_uuid UUID;
BEGIN
  -- 障害者福祉会館
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, description, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '障害者福祉会館', 'ショウガイシャフクシカイカン',
          '開館時間: 月曜日から日曜日 9:00-22:00、毎月第3月曜日、年末年始は利用不可。', 'その他', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, access_info, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '沼袋2-40-18', 35.7236111514129, 139.663046943301,
          '西武新宿線沼袋駅から徒歩7分、または中央線中野駅南口から京王バス中92系統練馬駅行き、江古田4丁目下車すぐ。', NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3389-2171', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'その他', NOW());

  -- かみさぎこぶし園
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, description, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, 'かみさぎこぶし園', 'カミサギコブシエン',
          '開館時間: 月曜日から金曜日 9:00-17:00、祝日、年末年始は利用不可。', '生活介護', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, access_info, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '上鷺宮1-21-30', 35.7298961545933, 139.636058495268,
          '中央線阿佐ヶ谷駅北口から関東バス中村橋行き、中村南3丁目下車徒歩5分。西武新宿線鷺ノ宮駅から徒歩15分。西武池袋線中村橋駅、富士見台駅から徒歩15分。', NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-5241-8121', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'その他', NOW());

  -- 弥生福祉作業所
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, description, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '弥生福祉作業所', 'ヤヨイフクシサギョウジョ',
          '開館時間: 月曜日から日曜日 9:00-22:00、祝日、年末年始は利用不可。', '就労継続支援B型', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, access_info, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '弥生町4-36-15', 35.6897650402174, 139.670896536041,
          '東京メトロ丸ノ内線　中野富士見町駅下車', NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3384-2939', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'その他', NOW());

  -- 仲町就労支援事業所
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, description, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '仲町就労支援事業所', 'ナカチョウシュウロウシエンジギョウショ',
          '開館時間: 月曜日から金曜日 9:00-17:00、祝日、年末年始は利用不可。', '就労移行支援', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, access_info, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '中央3-19-1', 35.7003729695231, 139.67420678233,
          'ＪＲ中野駅より徒歩19分、もしくは東京メトロ丸の内線新中野駅より徒歩11分。中野駅からのバス便あり。', NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3360-1571', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, '就労移行支援', NOW());
END $$;

-- =============================================================================
-- 6. 短期入所 (Short-term Facilities)
-- =============================================================================

DO $$
DECLARE
  facility_uuid UUID;
BEGIN
  -- しらさぎホーム
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, 'しらさぎホーム', NULL, '短期入所', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '白鷺二丁目51番5号', 35.7201369512867, 139.632038675453, NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3336-6255', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, '短期入所', NOW());

  -- ショートステイ翔和
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, 'ショートステイ翔和', NULL, '短期入所', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '江原町2-26-13', 35.7313347716459, 139.671829507739, NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-59065432', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, '短期入所', NOW());
END $$;

-- =============================================================================
-- 7. 相談支援事業所 (Consultation Centers)
-- =============================================================================

DO $$
DECLARE
  facility_uuid UUID;
BEGIN
  -- 鷺宮すこやか障害者相談支援事業所
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, description, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '鷺宮すこやか障害者相談支援事業所', NULL,
          '開設時間: 月曜日から土曜日 午前8時半～午後5時、休業日: 日曜日、祝日、年末年始(12月29日～1月3日)', 'その他', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, access_info, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '若宮三丁目58番10号', 35.7219029853213, 139.640280299243,
          '電車…西武新宿線「鷺ノ宮」駅下車 南口より徒歩5分 バス…関東バス（阿佐ヶ谷03、荻窪06）', NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, fax, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-6265-5770', '03-6265-5772', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'その他', NOW());

  -- 北部すこやか障害者相談支援事業所
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, description, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '北部すこやか障害者相談支援事業所', NULL,
          '開設時間: 月曜日から土曜日 午前8時半～午後5時、休業日: 日曜日、祝日、年末年始(12月29日～1月3日)', 'その他', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, latitude, longitude, access_info, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '江古田四丁目31番10号', 35.7246855774545, 139.661371932292,
          '電車…西武新宿線「沼袋」駅下車 北口より徒歩10分 バス…京王バス（中92）「江古田4丁目」下車 徒歩2分', NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, fax, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-5942-5800', '03-5942-5802', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'その他', NOW());

  -- 地域生活支援センター「せせらぎ」
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, description, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '地域生活支援センター「せせらぎ」', NULL,
          '相談・オープンスペースの利用: 火水木 午前11時半から午後7時半、金 午後1時から午後8時半、土日 午前10時から午後5時、休業日: 月曜日・祝日・12月29日から1月3日', 'その他', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, building, latitude, longitude, access_info, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '中野五丁目68番7号', 'スマイルなかの6F', 35.7092059006025, 139.665291578738,
          'JR中野駅から徒歩7分', NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3387-0993', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'その他', NOW());

  -- 障害者地域自立生活支援センター「つむぎ」
  facility_uuid := gen_random_uuid();
  INSERT INTO facilities (id, created_at, updated_at) VALUES (facility_uuid, NOW(), NOW());
  INSERT INTO facility_profiles (id, facility_id, name, name_kana, description, service_type, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '障害者地域自立生活支援センター「つむぎ」', NULL,
          '利用時間: 午後1時から午後6時45分、受付は午後6時半まで。電話相談は24時間受付。休業日: 月曜日・祝日・年末年始', 'その他', NOW(), NOW());
  INSERT INTO facility_locations (id, facility_id, prefecture, city, street, building, latitude, longitude, access_info, created_at, updated_at)
  VALUES (gen_random_uuid(), facility_uuid, '東京都', '中野区', '中野五丁目68番7号', 'スマイルなかの5F', 35.7092059006025, 139.665291578738,
          NULL, NOW(), NOW());
  INSERT INTO facility_contacts (id, facility_id, contact_type, phone, fax, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'main', '03-3389-2375', '03-5942-5811', NOW());
  INSERT INTO facility_services (id, facility_id, service_type, created_at)
  VALUES (gen_random_uuid(), facility_uuid, 'その他', NOW());
END $$;

COMMIT;

-- =============================================================================
-- インポート確認用クエリ
-- =============================================================================
-- 施設数の確認
SELECT 
  COUNT(*) as total_facilities,
  COUNT(DISTINCT fp.service_type) as service_types
FROM facilities f
LEFT JOIN facility_profiles fp ON f.id = fp.facility_id;

-- サービス種別ごとの施設数
SELECT 
  fp.service_type,
  COUNT(*) as count
FROM facility_profiles fp
GROUP BY fp.service_type
ORDER BY count DESC;

-- 施設一覧
SELECT 
  fp.name,
  fp.service_type,
  fl.city,
  fl.street,
  fc.phone
FROM facilities f
LEFT JOIN facility_profiles fp ON f.id = fp.facility_id
LEFT JOIN facility_locations fl ON f.id = fl.facility_id
LEFT JOIN facility_contacts fc ON f.id = fc.facility_id AND fc.contact_type = 'main'
ORDER BY fp.service_type, fp.name;