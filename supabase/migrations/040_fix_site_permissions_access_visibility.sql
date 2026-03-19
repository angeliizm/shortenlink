-- Fix: 1) Admin/moderator can grant permissions from UI (INSERT/UPDATE/DELETE on site_permissions)
--       2) Users with view, edit OR analytics permission can see the site in dashboard (pages SELECT)

-- 1) site_permissions: allow admin and moderator to manage permissions (so grant/revoke from UI works)
DROP POLICY IF EXISTS "Admin and moderator can manage site permissions" ON public.site_permissions;
CREATE POLICY "Admin and moderator can manage site permissions" ON public.site_permissions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'moderator')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'moderator')
        )
    );

-- 2) pages: allow viewing page if user has view, edit OR analytics (so any granted permission shows site in list)
DROP POLICY IF EXISTS "Users can view pages based on permissions" ON pages;
CREATE POLICY "Users can view pages based on permissions" ON pages
    FOR SELECT USING (
        get_user_role() IN ('admin', 'moderator') OR
        owner_id = auth.uid() OR
        has_site_permission(site_slug, 'view', auth.uid()) OR
        has_site_permission(site_slug, 'edit', auth.uid()) OR
        has_site_permission(site_slug, 'analytics', auth.uid())
    );

-- 3) page_actions: same for view – allow view if user has view, edit or analytics on the page
DROP POLICY IF EXISTS "Users can view page actions based on permissions" ON page_actions;
CREATE POLICY "Users can view page actions based on permissions" ON page_actions
    FOR SELECT USING (
        get_user_role() IN ('admin', 'moderator') OR
        page_id IN (
            SELECT id FROM pages
            WHERE owner_id = auth.uid()
            OR has_site_permission(site_slug, 'view', auth.uid())
            OR has_site_permission(site_slug, 'edit', auth.uid())
            OR has_site_permission(site_slug, 'analytics', auth.uid())
        )
    );

-- 4) pages UPDATE: use correct has_site_permission(site_slug, type, uid) order (fixes edit permission)
DROP POLICY IF EXISTS "Users can update pages based on permissions" ON pages;
CREATE POLICY "Users can update pages based on permissions" ON pages
    FOR UPDATE USING (
        get_user_role() IN ('admin', 'moderator') OR
        owner_id = auth.uid() OR
        has_site_permission(site_slug, 'edit', auth.uid())
    );

-- 5) page_actions manage: use correct argument order for has_site_permission
DROP POLICY IF EXISTS "Users can manage page actions based on permissions" ON page_actions;
CREATE POLICY "Users can manage page actions based on permissions" ON page_actions
    FOR ALL USING (
        get_user_role() IN ('admin', 'moderator') OR
        page_id IN (
            SELECT id FROM pages
            WHERE owner_id = auth.uid()
            OR has_site_permission(site_slug, 'edit', auth.uid())
        )
    )
    WITH CHECK (
        get_user_role() IN ('admin', 'moderator') OR
        page_id IN (
            SELECT id FROM pages
            WHERE owner_id = auth.uid()
            OR has_site_permission(site_slug, 'edit', auth.uid())
        )
    );
