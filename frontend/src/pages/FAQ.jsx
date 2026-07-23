const answeredQuestions = [
  {
    group: 'Über den Lebens-Finanzplaner',
    items: [
      {
        question: 'Was ist der Lebens-Finanzplaner?',
        answer:
          'Der Lebens-Finanzplaner unterstützt dich dabei, deine persönliche finanzielle Entwicklung besser zu verstehen und langfristig zu planen. Auf Grundlage deiner Einnahmen, Ausgaben, Rücklagen und Sparziele kannst du Prognosen erstellen, verschiedene Szenarien ausprobieren und verfolgen, wie sich deine Entscheidungen auf deine finanzielle Zukunft auswirken können.',
      },
      {
        question: 'Sind die angezeigten Prognosen garantiert?',
        answer:
          'Nein. Die Prognosen basieren auf deinen eingegebenen Daten und den von dir gewählten Annahmen, zum Beispiel zur Sparrate oder erwarteten Rendite. Sie dienen zur Orientierung und können von der tatsächlichen finanziellen Entwicklung abweichen.',
      },
    ],
  },
  {
    group: 'Konto & Finanzdaten',
    items: [
      {
        question: 'Welche Daten werden von mir benötigt?',
        answer:
          'Für die Berechnungen benötigt der Lebens-Finanzplaner einige persönliche und finanzielle Angaben. Dazu gehören unter anderem dein Geburtsdatum, deine monatlichen Einnahmen und Ausgaben, deine Sparraten, vorhandene Rücklagen sowie Angaben zur Altersvorsorge. Diese Informationen bilden die Grundlage für deine persönlichen Auswertungen und Prognosen.',
      },
      {
        question: 'Warum muss ich mein Geburtsdatum angeben?',
        answer:
          'Das Geburtsdatum wird benötigt, um langfristige Berechnungen und Prognosen zeitlich einordnen zu können, beispielsweise im Zusammenhang mit deinem geplanten Renteneintritt.',
      },
      {
        question: 'Kann ich meine Finanzdaten später ändern?',
        answer:
          'Ja. Wenn sich beispielsweise dein Einkommen, deine Ausgaben oder deine Rücklagen verändern, kannst du deine Finanzdaten im Bereich „Meine Finanzen“ aktualisieren. Die Berechnungen und Prognosen können dadurch an deine aktuelle finanzielle Situation angepasst werden.',
      },
      {
        question: 'Was passiert, wenn sich meine Einnahmen oder Ausgaben ändern?',
        answer:
          'Änderungen deiner finanziellen Situation kannst du jederzeit im Finanzplaner berücksichtigen. Aktualisierte Werte können anschließend für neue Berechnungen, Szenarien und Prognosen verwendet werden.',
      },
    ],
  },
  {
    group: 'Szenarien & Prognosen',
    items: [
      {
        question: 'Wie kann ich die Szenarien verwenden?',
        answer:
          'Mit dem Szenario-Simulator kannst du ausprobieren, wie sich unterschiedliche Annahmen auf deine finanzielle Entwicklung auswirken. Du kannst beispielsweise dein monatliches Einkommen, deine Ausgaben, deine Sparquote oder die erwartete Rendite verändern und die Auswirkungen direkt miteinander vergleichen.',
      },
      {
        question: 'Wie berechnet sich die Sparquote?',
        answer:
          'Die Sparquote beschreibt, welcher Anteil deines monatlichen Nettoeinkommens gespart wird. Wenn du beispielsweise bei einem Nettoeinkommen von 3.000 € monatlich 600 € sparst, entspricht das einer Sparquote von 20 Prozent.',
      },
      {
        question: 'Was ist der Unterschied zwischen aktuellem und optimiertem Sparen?',
        answer:
          'Das aktuelle Sparen ergibt sich aus der Differenz zwischen deinen monatlichen Einnahmen und Ausgaben. Das optimierte Sparen basiert dagegen auf der im Szenario eingestellten Sparquote und zeigt, welchen Betrag du entsprechend dieser Sparquote monatlich zurücklegen würdest.',
      },
      {
        question: 'Was bedeutet „Nach 5 Jahren“?',
        answer:
          'Der Wert zeigt, wie sich deine monatlichen Einzahlungen über einen Zeitraum von fünf Jahren entwickeln könnten, wenn zusätzlich die von dir eingestellte erwartete Rendite berücksichtigt wird. Es handelt sich dabei um eine Modellrechnung und nicht um eine garantierte Wertentwicklung.',
      },
      {
        question: 'Welche Rolle spielt die erwartete Rendite?',
        answer:
          'Die erwartete Rendite ist eine Annahme darüber, wie stark sich investiertes Kapital durchschnittlich entwickeln könnte. Je höher die angenommene Rendite ist, desto stärker wirkt sich der Zinseszinseffekt auf langfristige Prognosen aus. Tatsächliche Renditen können jedoch deutlich höher oder niedriger ausfallen.',
      },
      {
        question: 'Wie kann ich die Rendite meiner Anlagen ermitteln?',
        answer:
          'Die Rendite beschreibt die Wertentwicklung einer Anlage über einen bestimmten Zeitraum. Für eine einfache Einschätzung kannst du den aktuellen Wert deiner Anlage mit dem ursprünglich investierten Betrag vergleichen. Bei regelmäßigen Einzahlungen oder längeren Anlagezeiträumen ist die Berechnung komplexer.',
      },
    ],
  },
  {
    group: 'Ziele',
    items: [
      {
        question: 'Wie kann ich Ziele anlegen und verwalten?',
        answer:
          'Im Bereich „Finanz-Szenarien & Ziele“ kannst du persönliche Sparziele anlegen. Dabei gibst du einen Namen für das Ziel, deinen bereits erreichten Betrag und den gewünschten Zielbetrag an. Bestehende Ziele kannst du später bearbeiten oder löschen.',
      },
      {
        question: 'Wie wird der Fortschritt eines Ziels berechnet?',
        answer:
          'Der Fortschritt eines Ziels ergibt sich aus deinem aktuell angesparten Betrag im Verhältnis zum festgelegten Zielbetrag. Hast du beispielsweise 2.500 € von einem Zielbetrag von 10.000 € erreicht, beträgt dein Fortschritt 25 Prozent.',
      },
      {
        question: 'Kann ich meine Ziele später verändern?',
        answer:
          'Ja. Wenn sich deine Planung ändert, kannst du sowohl den aktuellen Betrag als auch den Zielbetrag und den Namen eines bestehenden Ziels bearbeiten. Ziele, die du nicht mehr benötigst, kannst du außerdem löschen.',
      },
    ],
  },
  {
    group: 'KI-Finanzassistent',
    items: [
      {
        question: 'Was kann der KI-Finanzassistent?',
        answer:
          'Der KI-Finanzassistent unterstützt dich bei Fragen rund um deine persönliche Finanzplanung. Er kann deine hinterlegten Finanzdaten berücksichtigen und dir beispielsweise Fragen zu deiner Sparquote, deinem Nettovermögen, deinen finanziellen Zielen oder möglichen Rücklagen beantworten.',
      },
      {
        question: 'Welche Daten verwendet der KI-Finanzassistent?',
        answer:
          'Der KI-Finanzassistent kann die im Lebens-Finanzplaner hinterlegten Finanzinformationen verwenden, um seine Antworten besser auf deine persönliche Situation abzustimmen. Dadurch können Antworten individueller ausfallen als bei allgemeinen Finanzfragen.',
      },
      {
        question: 'Ersetzt der KI-Finanzassistent eine professionelle Finanzberatung?',
        answer:
          'Nein. Die Antworten des KI-Finanzassistenten dienen ausschließlich zur Information und Orientierung. Sie stellen keine professionelle Finanz-, Anlage-, Steuer- oder Rechtsberatung dar und sollten nicht als alleinige Grundlage für finanzielle Entscheidungen verwendet werden.',
      },
    ],
  },
  {
    group: 'Allgemeine Finanzfragen',
    items: [
      {
        question: 'Welche Anlageformen gibt es?',
        answer:
          'Zu den häufigen Anlageformen gehören beispielsweise Tagesgeld, Festgeld, ETFs, Aktien, Anleihen, Fonds, Immobilien und verschiedene Vorsorgeprodukte. Die Anlageformen unterscheiden sich unter anderem hinsichtlich Risiko, erwarteter Rendite, Kosten, Liquidität und Anlagehorizont. Welche Anlageform geeignet ist, hängt deshalb stark von der persönlichen finanziellen Situation und den eigenen Zielen ab.',
      },
      {
        question: 'Welche Möglichkeiten gibt es zur privaten Altersvorsorge?',
        answer:
          'Möglichkeiten zur privaten Altersvorsorge sind beispielsweise ETF-Sparpläne, private Rentenversicherungen, betriebliche Altersvorsorge, bestimmte staatlich geförderte Vorsorgeprodukte oder Immobilien. Welche Variante sinnvoll sein kann, hängt unter anderem von Einkommen, Alter, Risikobereitschaft, Kosten und gewünschter Flexibilität ab.',
      },
      {
        question: 'Was ist ein Notgroschen?',
        answer:
          'Ein Notgroschen ist eine finanzielle Rücklage für unerwartete Ausgaben, beispielsweise Reparaturen oder kurzfristige Einkommensausfälle. Häufig wird empfohlen, mehrere Monatsausgaben als schnell verfügbare Reserve zurückzulegen. Die passende Höhe hängt jedoch von deiner persönlichen Situation ab.',
      },
    ],
  },
]

function FAQ() {
  return (
    <div className="min-h-screen flex">
      {/* ===== LEFT SIDE ===== */}
      <div className="hidden lg:flex lg:w-2/5 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-slate-800/60"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-900/40"></div>

        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <polyline
                points="3 17 9 11 13 15 21 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-lg font-bold">FinanzPlaner</h1>
            <p className="text-xs text-slate-400">Lebensplanung</p>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Deine Finanzen.
            <br />
            Dein Leben.
            <br />
            <span className="text-emerald-500">Geplant.</span>
          </h2>

          <p className="text-slate-400 text-sm max-w-sm">
            Vermögensprojektionen, Ziel-Tracking und KI-Beratung — alles in
            einer Übersicht.
          </p>
        </div>

        <div className="relative flex gap-12">
          <div>
            <div className="text-2xl font-bold text-emerald-500">30+</div>
            <div className="text-xs text-slate-400">Jahre Prognose</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-emerald-500">4</div>
            <div className="text-xs text-slate-400">Szenarien</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-emerald-500">KI</div>
            <div className="text-xs text-slate-400">Assistent</div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT SIDE ===== */}
      <div className="flex-1 bg-stone-50 overflow-y-auto px-6 py-16 sm:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-10 border-b border-slate-200 pb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-3">
              Hilfe & Antworten
            </p>

            <h2 className="text-4xl font-bold text-slate-900 mb-3">
              FAQ
            </h2>

            <p className="max-w-2xl text-slate-600">
              Hier findest du Antworten zu den wichtigsten Fragen rund um den
              Lebens-Finanzplaner, deine Prognosen und die verschiedenen
              Funktionen der Anwendung. Bei weiteren Fragen kannst du auch
              unseren KI-Assistenten nutzen.
            </p>
          </div>

          <div className="space-y-8">
            {answeredQuestions.map(group => (
              <section key={group.group}>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
                  {group.group}
                </h3>

                <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
                  {group.items.map(item => (
                    <details key={item.question} className="group">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50">
                        <span>{item.question}</span>

                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition group-open:rotate-45 group-open:border-emerald-200 group-open:text-emerald-600">
                          +
                        </span>
                      </summary>

                      <div className="px-5 pb-5 text-sm leading-6 text-slate-600">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQ
