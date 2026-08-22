-- Allow authenticated users to upload, update, and delete files in the products bucket
CREATE POLICY "Allow authenticated uploads to products" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products');
CREATE POLICY "Allow authenticated updates to products" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'products');
CREATE POLICY "Allow authenticated deletes to products" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'products');

-- Optional: Do the same for other CMS buckets if they will also be uploaded from the dashboard
CREATE POLICY "Allow authenticated uploads to categories" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'categories');
CREATE POLICY "Allow authenticated updates to categories" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'categories');
CREATE POLICY "Allow authenticated deletes to categories" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'categories');

CREATE POLICY "Allow authenticated uploads to brands" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'brands');
CREATE POLICY "Allow authenticated updates to brands" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'brands');
CREATE POLICY "Allow authenticated deletes to brands" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'brands');

CREATE POLICY "Allow authenticated uploads to banners" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'banners');
CREATE POLICY "Allow authenticated updates to banners" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'banners');
CREATE POLICY "Allow authenticated deletes to banners" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'banners');
