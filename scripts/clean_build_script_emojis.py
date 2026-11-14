import re

with open('/home/antigravity/scripts/build_grand_public_apps.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Inline SVG definitions
svg_flame = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
svg_sliders = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="21" y2="21"/><line x1="4" x2="20" y1="14" y2="14"/><line x1="4" x2="20" y1="7" y2="7"/><line x1="14" x2="14" y1="11" y2="17"/><line x1="8" x2="8" y1="4" y2="10"/><line x1="16" x2="16" y1="18" y2="24"/></svg>'
svg_activity = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>'
svg_zap = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
svg_dumbbell = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>'
svg_leaf = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>'
svg_utensils = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 11v11"/><path d="M5 2c0 4 2 6 4 7v13"/></svg>'
svg_fish = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 4c-1 1.5-1 3.5 0 5 1.05 1.57 1.05 3.43 0 5-1 1.5-1 3.5 0 5 2.85-1.97 4.27-4 4.27-6.67v-1.66Z"/></svg>'
svg_book = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 2v20"/></svg>'
svg_calendar = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>'
svg_cart = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>'
svg_chef = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.8a4.41 4.41 0 1 1 5-7.6 4.42 4.42 0 0 1 6 0 4.43 4.43 0 1 1 5 7.6"/><path d="M6 17h12a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2Z"/></svg>'

# Brand icon
c = c.replace('<div class="brand-icon">🔥</div>', f'<div class="brand-icon" style="display:flex; align-items:center; justify-content:center; color:#FFF;">{svg_flame}</div>')

# Config card header icon
c = c.replace('''      <div style="display:flex; align-items:center; gap:10px;">
        <div style="width:34px; height:34px; border-radius:12px; background:var(--ink-900); color:#FFF; display:flex; align-items:center; justify-content:center; font-size:16px;">
          🎯
        </div>''',
f'''      <div style="display:flex; align-items:center; gap:10px;">
        <div style="width:34px; height:34px; border-radius:12px; background:var(--ink-900); color:var(--coral); display:flex; align-items:center; justify-content:center;">
          {svg_sliders}
        </div>''')

c = c.replace('Replier ✕', 'Replier')

# Profile summary tag
c = c.replace('<span id="lbl-profile-summary" style="color:var(--coral); font-weight:900;">⚡ Sportif (1.8g/kg)</span>',
              '<span id="lbl-profile-summary" style="color:var(--coral); font-weight:900;">Sportif (1.8g/kg)</span>')

# Profile card icons
c = c.replace('<span class="profile-icon">🚶</span>', f'<span class="profile-icon" style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:8px; background:rgba(255,90,54,0.1); color:var(--coral);">{svg_activity}</span>')
c = c.replace('<span class="profile-icon">⚡</span>', f'<span class="profile-icon" style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:8px; background:rgba(255,90,54,0.1); color:var(--coral);">{svg_zap}</span>')
c = c.replace('<span class="profile-icon">🏋️</span>', f'<span class="profile-icon" style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:8px; background:rgba(255,90,54,0.1); color:var(--coral);">{svg_dumbbell}</span>')

# Diet buttons
c = c.replace('>🍖 Tout<', '>Omnivore<')
c = c.replace('>🌱 Végé<', '>Végétarien<')
c = c.replace('>🐟 Pesco<', '>Pescatarien<')

# Pleasure toggle
c = c.replace('<span>🍔 Smash Burger du vendredi</span>', f'<span style="display:inline-flex; align-items:center; gap:6px;">{svg_utensils} <span>Option plaisir du vendredi</span></span>')

# Collapsed pill
c = c.replace('<span style="font-size:16px;">🎯</span>', f'<span style="display:inline-flex; align-items:center; color:var(--coral);">{svg_sliders}</span>')
c = c.replace('72 kg • ⚡ Sportif • ~65g prot/repas • 🍖 Omnivore • 2 pers',
              '72 kg • Sportif • ~65g prot/repas • Omnivore • 2 pers')

# Menu summary bar
c = c.replace('<span style="font-size:18px;">📋</span>', f'<span style="display:inline-flex; align-items:center; color:var(--coral);">{svg_calendar}</span>')
c = c.replace('<span id="summary-profile-tag" style="color:var(--coral); font-weight:900;">🏃 Profil Sportif</span>',
              '<span id="summary-profile-tag" style="color:var(--coral); font-weight:900;">Profil Sportif</span>')

# Search input
c = c.replace('placeholder="🔍 Rechercher (ex: poulet, skyr, burger, dal, saumon)..."',
              'placeholder="Rechercher (ex: poulet, skyr, burger, dal, saumon)..."')

# Category chips
c = c.replace('🍗 Volailles', 'Volailles')
c = c.replace('🥩 Bœuf 5%', 'Bœuf 5%')
c = c.replace('🐟 Poissons', 'Poissons')
c = c.replace('🧀 Halloumi AOP', 'Halloumi & Fromages')
c = c.replace('🌱 100% Végétal', '100% Végétal')
c = c.replace('🍲 Légumineuses', 'Dals & Légumes')
c = c.replace('💰 Éco &lt; 2,50€', 'Éco (&lt; 2,50€)')
c = c.replace('🍔 Plats Plaisir', 'Option Plaisir')

c = c.replace('✓ Filtrées selon vos choix', 'Recettes adaptées à vos critères')
c = c.replace('Bilan Nutritionnel Quotidien • Profil Sportif 🏃', 'Bilan Nutritionnel Quotidien • Profil Sportif')
c = c.replace('📖 5 Fiches Recettes', 'Fiches Recettes')

# Floating dock
c = c.replace('>📖 Catalogue<', f' style="display:inline-flex; align-items:center; justify-content:center; gap:6px;">{svg_book} <span>Catalogue</span><')
c = c.replace('>📋 Mon Menu<', f' style="display:inline-flex; align-items:center; justify-content:center; gap:6px;">{svg_calendar} <span>Mon Menu</span><')
c = c.replace('>🛒 Courses<', f' style="display:inline-flex; align-items:center; justify-content:center; gap:6px;">{svg_cart} <span>Courses</span><')
c = c.replace('>🧑‍🍳 Préparation<', f' style="display:inline-flex; align-items:center; justify-content:center; gap:6px;">{svg_chef} <span>Préparation</span><')

# Comments in HTML
c = c.replace('VUE 1 (PAR DÉFAUT) : 📖 CATALOGUE DE 30 RECETTES', 'VUE 1 (PAR DÉFAUT) : CATALOGUE DE 30 RECETTES')
c = c.replace('VUE 2 : 📋 MON MENU DE LA SEMAINE & BILAN NUTRITIONNEL', 'VUE 2 : MON MENU DE LA SEMAINE & BILAN NUTRITIONNEL')
c = c.replace('VUE 3 : 🛒 COURSES DYNAMIQUES PAR RAYON', 'VUE 3 : COURSES DYNAMIQUES PAR RAYON')
c = c.replace('VUE 4 : 🧑‍🍳 PRÉPARATION (SESSION CUISINE & RECETTES PRÉVUES)', 'VUE 4 : PRÉPARATION (SESSION CUISINE & RECETTES PRÉVUES)')

# JS Code in build script
c = c.replace("state.diet === 'vege' ? 'Végé 🌱' : state.diet === 'pesco' ? 'Pesco 🐟' : 'Omnivore 🍖'",
              "state.diet === 'vege' ? 'Végétarien' : state.diet === 'pesco' ? 'Pescatarien' : 'Omnivore'")

c = c.replace("summaryPill.textContent = state.weight + ' kg • ' + prof.icon + ' ' + prof.name + ' • ~' + targetMeal + 'g prot/repas • ' + dietLabel + ' • ' + state.people + ' pers';",
              "summaryPill.textContent = state.weight + ' kg • ' + prof.name + ' • ~' + targetMeal + 'g prot/repas • ' + dietLabel + ' • ' + state.people + ' pers';")

c = c.replace("pleBadge.textContent = state.pleasure ? '✓ Activé' : '+ Activer';",
              "pleBadge.textContent = state.pleasure ? 'Activé' : '+ Activer';")

c = c.replace("if (p === 110) return {{ name: 'Actif', icon: '🚶', tag: '108g/j', rhythm: 'Forme (1.5g/kg)' }};",
              "if (p === 110) return {{ name: 'Actif', icon: '', tag: '108g/j', rhythm: 'Forme (1.5g/kg)' }};")
c = c.replace("if (p === 160) return {{ name: 'Athlète', icon: '🏋️', tag: '158g/j', rhythm: 'Muscu (2.2g/kg)' }};",
              "if (p === 160) return {{ name: 'Athlète', icon: '', tag: '158g/j', rhythm: 'Muscu (2.2g/kg)' }};")
c = c.replace("return {{ name: 'Sportif', icon: '🏃', tag: '130g/j', rhythm: 'Tonus (1.8g/kg)' }};",
              "return {{ name: 'Sportif', icon: '', tag: '130g/j', rhythm: 'Tonus (1.8g/kg)' }};")

c = c.replace("triggerToast('🍔 Smash Burger du vendredi soir ajouté à la semaine !');",
              "triggerToast('Option plaisir du vendredi ajoutée à la semaine !');")
c = c.replace("triggerToast('🥗 Semaine repassée à 100% plats équilibrés.');",
              "triggerToast('Semaine calibrée sur les plats équilibrés.');")

c = c.replace("btn.textContent = '✓ Avec plaisir !';", "btn.textContent = 'Option activée';")
c = c.replace("triggerToast('🍔 Plat plaisir activé pour le vendredi !');",
              "triggerToast('Option plaisir activée pour le vendredi !');")

c = c.replace("btn.textContent = state.filterOnlyMatching ? '✓ Filtrées selon vos choix' : 'Afficher les 30 recettes';",
              "btn.textContent = state.filterOnlyMatching ? 'Recettes adaptées' : 'Afficher toutes les recettes';")

c = c.replace("btn.textContent = 'Terminé 🎉';", "btn.textContent = 'Terminé';")
c = c.replace("triggerToast('✅ ' + r.shortName + ' ajouté au ' + SHORT_DAYS[slotIdx] + ' ! Ingrédients & préparation synchronisés.');",
              "triggerToast(r.shortName + ' ajouté au ' + SHORT_DAYS[slotIdx] + ' — synchronisé.');")

c = c.replace("'<div class=\"slot-day-badge\">📅 ' + DAYS[idx] + '</div>'",
              "'<div class=\"slot-day-badge\">' + DAYS[idx] + '</div>'")
c = c.replace("'<button class=\"slot-swap-btn\" onclick=\"promptSwap(' + idx + ')\">🔄 Changer</button>'",
              "'<button class=\"slot-swap-btn\" onclick=\"promptSwap(' + idx + ')\">Remplacer</button>'")

c = c.replace("'✓ Choisir pour ' + DAYS[state.targetSlotToSwap] + '</button>'",
              "'Choisir pour ' + DAYS[state.targetSlotToSwap] + '</button>'")

c = c.replace("'✓ ' + aisleItems.length + ' condiments du placard déduits du panier'",
              "aisleItems.length + ' condiments du placard déduits du panier'")

c = c.replace("'<div class=\"g-chk\">' + (isChecked ? '✓' : '') + '</div>'",
              "'<div class=\"g-chk\">' + (isChecked ? '✓' : '') + '</div>'")

c = c.replace("(isDone ? '✓ Étape terminée' : 'Marquer comme fait')",
              "(isDone ? 'Étape terminée' : 'Marquer comme fait')")

c = c.replace("'<span class=\"cat-badge-green\">📅 ' + DAYS[dIdx] + '</span>'",
              "'<span class=\"cat-badge-green\">' + DAYS[dIdx] + '</span>'")

c = c.replace("'<span class=\"cat-badge\">' + prof.icon + ' ' + getDishProtein(d) + 'g PROT / repas</span>'",
              "'<span class=\"cat-badge\">' + getDishProtein(d) + 'g PROT / repas</span>'")

c = c.replace("stationsHtml += '<span style=\"background:var(--coral-light); color:var(--coral); font-size:11px; font-weight:800; padding:4px 10px; border-radius:99px;\">🔥 ' + m + '</span>';",
              "stationsHtml += '<span style=\"background:var(--coral-light); color:var(--coral); font-size:11px; font-weight:800; padding:4px 10px; border-radius:99px;\">' + m + '</span>';")

with open('/home/antigravity/scripts/build_grand_public_apps.py', 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated build_grand_public_apps.py without emojis!')
