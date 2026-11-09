/* THE NOTES — what each system counts, and what its month name means.
 * ----------------------------------------------------------------------------
 * Loaded by /eleven-days alone, so the other twelve pages carry none of this
 * weight. page.js reads window.ELEVEN_GLOSS for three things: the epoch in
 * the 98 window's "Counts from" column, the note each ledger row opens onto,
 * and the line under the featured answer. Without it those read as dashes,
 * which is how its removal got caught.
 *
 * ACCURACY. Every month note follows the engine's own name tables rather than
 * general knowledge — src/engine.js lines 340-365 in DyllonWright/Eleven-Days.
 * Two worth keeping because somebody checked them against the engine instead
 * of assuming:
 *
 *   18 Brumaire. buildCalendars('1799-11-09') returns An VIII, Brumaire, 18,
 *   so the republican month and day of Napoleon's coup fall on 9 November.
 *
 *   An 122 · V:12 decodes as the fifth docosade, twelfth year: 5 × 22 + 12.
 *
 * Never hand-write a computed figure into this file. An earlier draft of the
 * page carried a rata die of 740,197 for 9 November 2026, invented rather than
 * computed; the engine returns 739,929. Compute every such number.
 */
window.ELEVEN_GLOSS = {

  epoch: {
    gregorian: "1 C.E., the estimated birth of Jesus Christ",
    illuminati: "4000 BCE, the first dawn of civilization",
    erisian: "1184 BCE, the Original Snub",
    pataphysical: "8 September 1873, Alfred Jarry's birth",
    poundian: "30 October 1921, Joyce finishing Ulysses",
    thelemic: "1904, the Aeon of Horus",
    frenchRev: "22 September 1792, the First Republic",
    islamic: "622 C.E., the Hejira",
    chinese: "2698 BCE, the Yellow Emperor",
    mayan: "3114 BCE, the creation epoch",
    hebrew: "3761 BCE, Anno Mundi"
  },

  /* Each entry: y / m / d, and each of those a short lead and a longer note. */
  notes: {
    gregorian: {
      y: ["Counts from the estimated birth of Jesus Christ",
          "Pope Gregory XIII reformed the Julian calendar in 1582, dropping ten days and tightening the leap rule. Most of the world now keeps civil time by it."],
      m: ["November, from the Latin novem, nine",
          "It sat ninth in the old Roman year that began in March. Two later insertions pushed it to eleventh and nobody renamed it."],
      d: ["A plain solar month",
          "The Gregorian day carries no cycle of its own beyond the seven-day week."]
    },
    illuminati: {
      y: ["Anno Lucis, counting from 4000 BCE",
          "Masonic documents add 4000 to the Gregorian year and call the result the Year of Light."],
      m: ["One of five seasons named in German",
          "Verwirrung, Zweitracht, Unordnung, Beamtenherrschaft, Realpolitik — confusion, discord, disorder, rule by officials, power politics. The stages of a conspiracy."],
      d: ["One of 73",
          "Five seasons of 73 days make the 365."]
    },
    erisian: {
      y: ["Counts from 1184 BCE, the Original Snub",
          "Eris, uninvited, threw a golden apple marked KALLISTI into the wedding of Peleus and Thetis. Discordians date the world from the argument that followed."],
      m: ["One of five 73-day seasons",
          "Chaos, Discord, Confusion, Bureaucracy, and this one. The same 365 days as the Gregorian year, cut a different way."],
      d: ["One of 73",
          "Five days a year fall outside the ordinary reckoning as Apostle holy days."]
    },
    pataphysical: {
      y: ["Counts from Alfred Jarry's birth, 8 September 1873",
          "The Collège de 'Pataphysique dates its era from the nativity of the man who invented the science of imaginary solutions."],
      m: ["One of thirteen months out of Jarry",
          "Absolu, Haha, As, Sable, Décervelage, Gueules, Pédale, Clinamen, Palotin, Merdre, Gidouille, Tatane, Phalle. Décervelage means debraining, from Ubu Roi."],
      d: ["One of 28",
          "Thirteen months of 28 days, plus an imaginary 29 February that arrives every year."]
    },
    poundian: {
      y: ["Counts from 30 October 1921",
          "The day James Joyce wrote the last words of Ulysses. Ezra Pound proposed dating the post-Christian era from it."],
      m: ["A month renamed for a god",
          "Zeus, Hermes, Saturnus, Cybele, Faunus, Aphrodite, Athena, Apollo, Artemis, Demeter, Pluto, Hephaestus. 1 Zeus falls on 31 October."],
      d: ["Lengths follow the Gregorian ones",
          "Offset by the epoch, so the day number runs a few behind the civil date."]
    },
    thelemic: {
      y: ["Counts from 1904, the Aeon of Horus",
          "Crowley received The Book of the Law in Cairo that spring. The second figure gives the docosade: the fifth cycle of 22 years, twelfth year within it, and 5 × 22 + 12 = 122."],
      m: ["The Sun standing in a zodiac sign",
          "Thelemic dating names no fixed months. The month turns on the Sun's ingress rather than on a day number."],
      d: ["Counted from the equinox",
          "The year turns at the March equinox, not at midnight on 1 January."]
    },
    frenchRev: {
      y: ["Counts from 22 September 1792",
          "The day the First Republic abolished the monarchy, which also fell on the Paris autumn equinox. Every year since turns on that equinox."],
      m: ["Named for the weather and the farming",
          "Fabre d'Églantine's twelve: Vendémiaire for the vintage, Brumaire for the fog, Nivôse for the snow, Thermidor for the heat."],
      d: ["One of 30",
          "Twelve months of thirty days, with five or six left at the end of the year as the sans-culottides."]
    },
    islamic: {
      y: ["Counts from 622 C.E., the Hejira",
          "The emigration of the Prophet Muhammad from Mecca to Medina. A purely lunar year runs about eleven days short of a solar one, so the whole calendar walks backward through the seasons."],
      m: ["A name older than the drift",
          "Jumada belonged to a dry or frozen pre-Islamic season. Because the year no longer tracks the sun, the month long ago left the weather it was named for."],
      d: ["One of 29 or 30",
          "Months begin with the new crescent, so the moon decides when one ends."]
    },
    chinese: {
      y: ["Counts from 2698 BCE",
          "The legendary ascension of the Yellow Emperor. The animal names the year in the twelve-year cycle."],
      m: ["A lunar month, tied back to the sun",
          "Months follow the new moons; the solar terms decide which month takes the leap. That pairing keeps a lunar count from drifting."],
      d: ["Day one means a new moon",
          "Every Chinese month opens on the dark moon."]
    },
    mayan: {
      y: ["The Long Count, from 3114 BCE",
          "Read it baktun.katun.tun.uinal.kin — 144,000 days, 7,200, 360, 20, and 1. The figure counts days since the creation epoch."],
      m: ["The Haab, a 365-day year",
          "Eighteen twenty-day months plus Uayeb, five days at the end that carry bad luck."],
      d: ["The Tzolk'in, a 260-day round",
          "Numbers 1 to 13 paired with twenty day names. It turns alongside the Haab, and the two realign only every 52 years."]
    },
    hebrew: {
      y: ["Anno Mundi, counting from 3761 BCE",
          "The traditional creation of the world, worked out from the genealogies in Genesis."],
      m: ["Cheshvan, sometimes Marcheshvan",
          "Read as bitter Cheshvan, because it holds no festival at all — the only month in the year with nothing in it."],
      d: ["One of 29 or 30",
          "Cheshvan and Kislev act as the two adjustable months that tune the year to both the moon and the sun."]
    }
  }
};
