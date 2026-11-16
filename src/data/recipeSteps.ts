export interface RecipeStepGuide {
  prep: string;
  cook: string;
  finish: string;
}

export const RECIPE_COOKING_STEPS: Record<string, RecipeStepGuide> = {
  d_greek: {
    prep: "Coupez le poulet en gros dés et marinez-le avec citron, origan et ail. Râpez le concombre pour le tzatziki.",
    cook: "Enfournez le poulet et les poivrons/oignons sur plaque 20 min à 200°C. Cuisez le riz basmati 11 min à l'eau bouillante.",
    finish: "Mélangez le skyr avec le concombre égoutté, menthe et citron. Dressez le riz, le poulet rôti et la sauce froide à part.",
  },
  d_chimi: {
    prep: "Taillez le poulet en aiguillettes et ciselez finement persil, coriandre, ail et vinaigre pour la sauce chimichurri.",
    cook: "Rôtissez le poulet au four 18 min à 200°C avec les légumes. Cuisez l'Ébly 10 min dans l'eau salée.",
    finish: "Nappez le poulet tiède de chimichurri vert (gardez-en un peu en pot séparé) et répartissez avec l'Ébly.",
  },
  d_tikka: {
    prep: "Détaillez le poulet en cubes et enrobez-le d'épices tikka massala, gingembre et un peu de yaourt.",
    cook: "Saisissez le poulet 4 min puis laissez mijoter 14 min avec les tomates concassées. Cuisez le riz basmati en parallèle.",
    finish: "Terminez avec le reste de yaourt hors du feu et parsemez de coriandre fraîche avant de mettre en boîtes.",
  },
  d_dinde_curry: {
    prep: "Émincez les filets de dinde, taillez les haricots verts et émincez l'oignon.",
    cook: "Faites dorer la dinde 5 min à la poêle avec la pâte de curry, déglacez au lait de coco et mijotez 10 min. Cuisez le riz.",
    finish: "Ajoutez les haricots verts croquants en fin de cuisson et répartissez avec le riz basmati.",
  },
  d_poulet_fajita: {
    prep: "Émincez le poulet et les poivrons en lanières, assaisonnez au cumin, paprika fumé et ail.",
    cook: "Enfournez poulet et poivrons 20 min à 200°C sur une grande plaque. Cuisez le riz et réchauffez les haricots noirs.",
    finish: "Dressez en bowl : riz, haricots noirs, maïs, poulet-poivrons rôtis et un quartier de citron vert.",
  },
  d_kefta: {
    prep: "Mélangez le bœuf haché 5% avec cumin, coriandre, oignon râpé et formez des boulettes ou brochettes kefta.",
    cook: "Saisissez les keftas 8 à 10 min à la poêle feu moyen-vif. Cuisez le boulgour 10 min à couvert.",
    finish: "Préparez une sauce froide skyr-menthe-citron et assemblez avec le boulgour et les keftas.",
  },
  d_chili_omni: {
    prep: "Émincez oignon et poivron, rincez les haricots rouges et le maïs.",
    cook: "Faites revenir le bœuf 5% avec les épices chili, ajoutez tomates concassées et haricots rouges, puis mijotez 18 min. Cuisez le riz.",
    finish: "Répartissez le chili bien réduit avec le riz dans vos contenants, ajoutez une pointe de coriandre.",
  },
  d_bolognaise: {
    prep: "Hachez finement oignon, ail et carotte en brunoise.",
    cook: "Faites revenir les légumes et le bœuf 5%, versez la passata et les herbes et mijotez 18 min. Cuisez les pâtes complètes al dente.",
    finish: "Mélangez les pâtes avec la sauce bolognaise et parsemez de parmesan râpé au moment de servir.",
  },
  d_steak_poivre: {
    prep: "Émincez l'échalote et concassez le poivre vert. Rincez les pois cassés.",
    cook: "Saisissez les steaks à la poêle 3 min par face, déglacez avec crème légère et poivre vert. Cuisez les pois cassés et haricots verts.",
    finish: "Tranchez le bœuf, nappez de sauce au poivre et servez avec la purée ou les pois cassés et haricots verts.",
  },
  d_thon_bowl: {
    prep: "Égouttez le thon blanc et les haricots blancs. Coupez tomates cerises, concombre et oignon rouge en dés.",
    cook: "Aucune cuisson requise : préparez une vinaigrette moutarde-citron-huile d'olive.",
    finish: "Assemblez les légumes croquants, haricots blancs et thon émietté, gardez la vinaigrette en petit pot séparé.",
  },
  d_saumon_teriyaki: {
    prep: "Badigeonnez les pavés de saumon de sauce soja, miel/sirop, ail et gingembre. Détaillez le brocoli en fleurettes.",
    cook: "Enfournez le saumon 12 à 14 min à 200°C. Cuisez le riz brun (20 min) et blanchissez le brocoli 4 min.",
    finish: "Laquez le saumon avec le jus teriyaki réduit, parsemez de graines de sésame et d'oignon nouveau.",
  },
  d_cabillaud_provencale: {
    prep: "Coupez tomates cerises, courgettes en rondelles et dénoyautez quelques olives.",
    cook: "Enfournez les dos de cabillaud sur un lit de tomates, courgettes, ail et herbes de Provence 16 min à 190°C. Cuisez l'Ébly 10 min.",
    finish: "Arrosez d'un trait de citron à la sortie du four et dressez avec l'Ébly.",
  },
  d_crevettes_wok: {
    prep: "Décortiquez les crevettes, émincez le pak choï et râpez ail et gingembre.",
    cook: "Cuisez les nouilles soba 4 min et rincez-les à l'eau froide. Saisissez les crevettes 3 min au wok très chaud avec les légumes.",
    finish: "Jetez les nouilles soba dans le wok avec la sauce soja-sésame, faites sauter 1 min et parsemez de sésame.",
  },
  d_halloumi: {
    prep: "Tranchez le halloumi en lamelles de 1 cm. Rincez les pois chiches et coupez les légumes méditerranéens.",
    cook: "Dorez le halloumi à sec dans une poêle bien chaude 2 min par face, puis rôtissez les pois chiches aux épices.",
    finish: "Assemblez avec les légumes frais et une sauce citron-herbes.",
  },
  d_paneer_curry: {
    prep: "Coupez le paneer (ou fromage ferme) en dés, rincez les épinards et le quinoa.",
    cook: "Faites fondre les épinards avec ail, gingembre et curry, mixez ou laissez mijoter avec le paneer 12 min. Cuisez le quinoa 12 min.",
    finish: "Servez le curry vert crémeux sur le quinoa chaud avec un filet de citron.",
  },
  d_mozza_feta: {
    prep: "Rincez l'orge perlé, coupez tomates et courgettes en dés, émiettez la feta.",
    cook: "Cuisez l'orge perlé 20 min dans l'eau salée. En parallèle, cuisez les œufs mollets 6 min puis passez-les sous l'eau froide.",
    finish: "Mélangez l'orge tiède aux légumes, herbes et feta ; ajoutez les œufs écalés au moment du dressage.",
  },
  d_tofu_satay: {
    prep: "Pressez et coupez le tofu ferme en cubes. Préparez la sauce satay (cacahuète, soja, citron vert).",
    cook: "Faites dorer le tofu à la poêle 8 min jusqu'à ce qu'il soit croustillant. Cuisez les œufs mollets 6 min et le riz.",
    finish: "Enrobez le tofu de sauce satay tiède, dressez avec le riz, les légumes verts et les œufs coupés en deux.",
  },
  d_med_tofu: {
    prep: "Coupez le tofu en dés et marinez-le avec origan, paprika et huile d'olive. Taillez courgettes et poivrons.",
    cook: "Enfournez le tofu et les légumes 22 min à 200°C en remuant à mi-cuisson. Cuisez la semoule ou le quinoa.",
    finish: "Mélangez le tout avec jus de citron et persil frais avant de répartir en boîtes.",
  },
  d_seitan_chili: {
    prep: "Émiettez ou coupez le seitan en petits dés. Rincez haricots rouges et maïs, émincez oignon et poivron.",
    cook: "Saisissez le seitan aux épices chili, ajoutez tomates concassées et haricots puis mijotez 16 min. Cuisez le riz.",
    finish: "Dressez le chili sin carne bien parfumé avec le riz basmati.",
  },
  d_tempeh_bowl: {
    prep: "Tranchez le tempeh fumé en lamelles et détaillez le brocoli ou patate douce.",
    cook: "Enfournez le tempeh et les légumes 20 min à 200°C. Préparez la sauce arachide-gingembre-soja à côté.",
    finish: "Servez sur une base de riz ou quinoa, nappez de sauce arachide et parsemez de sésame.",
  },
  d_tofu_katsu: {
    prep: "Coupez le tofu en escalopes, passez-le dans la chapelure panko/épices. Taillez carottes et oignons pour le curry.",
    cook: "Enfournez les escalopes de tofu 20 min à 200°C pour qu'elles dorent. Mijotez la sauce curry doux avec les légumes et cuisez le riz.",
    finish: "Tranchez le tofu katsu croustillant et déposez-le sur le riz et la sauce curry (gardez la sauce à part pour le croustillant).",
  },
  d_dal: {
    prep: "Rincez abondamment les lentilles corail. Émincez oignon, ail et gingembre.",
    cook: "Faites revenir les aromates avec curcuma et cumin, ajoutez lentilles corail, tomates et lait de coco, mijotez 16 min. Cuisez le riz.",
    finish: "Ajustez l'assaisonnement avec citron vert et coriandre fraîche, répartissez avec le riz.",
  },
  d_tiger: {
    prep: "Rincez les lentilles corail et coupez les légumes verts. Délayez le beurre de cacahuète avec sauce soja et citron.",
    cook: "Mijotez le dal de lentilles 15 min avec curcuma et gingembre, et faites sauter les légumes verts.",
    finish: "Dressez le dal chaud, ajoutez un filet de sauce satay cacahuète et des graines de sésame.",
  },
  d_haricots_cuban: {
    prep: "Rincez les haricots noirs. Émincez oignon, poivron vert et ail.",
    cook: "Faites revenir les légumes au cumin et origan, ajoutez haricots noirs et tomates concassées, mijotez 15 min. Cuisez le riz.",
    finish: "Terminez par un trait de citron vert et de la coriandre fraîche sur le riz aux haricots.",
  },
  d_pois_casses: {
    prep: "Rincez les pois cassés, émincez oignon, carotte et poireau.",
    cook: "Faites revenir les légumes puis mijotez avec les pois cassés et du bouillon 25 min jusqu'à tendreté.",
    finish: "Mixez pour obtenir un velouté rustique onctueux et garnissez de graines ou croûtons au service.",
  },
  d_burger_omni: {
    prep: "Formez des boules de bœuf haché 5%. Tranchez tomates, cornichons et préparez la sauce burger au skyr.",
    cook: "Smashez les steaks sur poêle brûlante 2 min par face avec le fromage. Toastez les pains briochés.",
    finish: "Montez les burgers ou gardez les steaks et garnitures séparés pour réchauffer le pain 1 min avant de manger.",
  },
  d_burger_vege: {
    prep: "Tranchez le halloumi en pavés épais, préparez salade, tomate et sauce yaourt-herbes.",
    cook: "Grillez le halloumi à la poêle 2 min par face jusqu'à croûte dorée et toastez les pains.",
    finish: "Assemblez avec la sauce fraîche et les crudités (gardez les crudités à part pour la version batch).",
  },
  d_tacos_omni: {
    prep: "Coupez le poulet en dés, émincez le chou rouge et préparez la salsa tomates-coriandre-citron vert.",
    cook: "Saisissez le poulet à la poêle avec la sauce barbecue et les épices 7 min jusqu'à caramélisation.",
    finish: "Chauffez les tortillas 30 sec à sec et garnissez de poulet BBQ, chou rouge croquant et salsa.",
  },
  d_pizza_prot: {
    prep: "Mélangez la farine avec le skyr pour former la pâte express (sans temps de pousse). Étalez finement.",
    cook: "Garnissez de sauce tomate, bœuf 5% pré-saisi et mozzarella, puis enfournez 12 à 14 min à 220°C.",
    finish: "Ajoutez basilic frais et origan à la sortie du four avant de découper en parts.",
  },
  d_burrito_vege: {
    prep: "Tranchez le halloumi en bâtonnets, rincez les haricots noirs et préparez riz et salsa.",
    cook: "Dorez le halloumi 4 min à la poêle, puis garnissez les grandes tortillas avec riz, haricots, halloumi et salsa.",
    finish: "Roulez serré en burrito et faites toaster 1 min par face à la poêle pour souder la fermeture.",
  },
};
