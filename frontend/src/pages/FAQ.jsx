const answeredQuestions = [
  {
    group: 'Was ist der Lebens-Finanzplaner?',
    items: [
      {
        question: 'Was ist der Lebens-Finanzplaner?',
        answer:
          'Machst du dir auch Gedanken darüber, wie du dich gut für die Rente absicherst? Wie viel du von deinem Gehalt sparen sollst und wie du dein Geld am besten anlegst? Der Lebens-Finanzplaner gibt dir hierfür personalisierte Antworten. Gib einfach deine Ein- und Ausgaben sowie dein Erspartes an und du kannst dir mit unseren Prognosetools anzeigen lassen, wie du deine Ziele am besten erreichst. Ob kurzfristige Träume wie die Weltreise im nächsten Jahr oder langfristige Ziele wie die Rente mit 50: Mit unserem Tool kannst du verschiedene Szenarien durchspielen und deine optimale Sparquote berechnen lassen.',
      },
    ],
  },
  {
    group: 'Konto anlegen',
    items: [
      {
        question: 'Welche Daten werden von mir benötigt?',
        answer:
          'Neben deinen persönlichen Daten wie Name und Geburtsdatum brauchen wir lediglich einige Daten zu deinen aktuellen Einnahmen und deinen Ausgaben sowie deinen Sparraten. Weiter werden einige Daten zur Altersvorsorge wie das geplante Renteneintrittsalter und Rentenpunkte abgefragt sowie einige Angaben zu deinem aktuellen Kontostand und Rücklagen benötigt.',
      },
      {
        question: 'Warum muss ich mein Geburtsdatum angeben?',
        answer:
          'Das Geburtsdatum wird benötigt, um deinen Renteneintritt ausrechnen zu können. Bitte achte darauf, dass es im Format TT/MM/JJJJ angegeben werden muss.',
      },
    ],
  },
  {
    group: 'Verwendung der Website',
    items: [
      {
        question: 'Wie kann ich Ziele anlegen und verwalten?',
        answer:
          'Im Bereich Finanz-Szenarien kannst du Ziele mit Titel, Zielbetrag, aktuellem Fortschritt und Zieljahr anlegen. Bestehende Ziele kannst du dort bearbeiten oder löschen, wenn sich deine Planung verändert.',
      },
      {
        question: 'Wie kann ich die Szenarien verwenden?',
        answer:
          'Mit Szenarien kannst du ausprobieren, wie sich Veränderungen auf deine finanzielle Entwicklung auswirken. Du kannst zum Beispiel andere Sparraten, Ausgaben, Einkommen oder Lebensereignisse einplanen und dir ansehen, wie sich deine Prognose dadurch verändert.',
      },
      {
        question: 'Was bedeutet optimiertes Sparen?',
        answer:
          'Optimiertes Sparen bedeutet, dass deine monatliche Sparrate so auf deine Ziele verteilt wird, dass wichtige oder zeitnahe Ziele besser erreichbar werden. Die Planung hilft dir zu erkennen, ob deine aktuelle Sparquote ausreicht oder angepasst werden sollte. Wenn du ganz besonders gut im Plan liegst, kann die optimierte Sparrate auch unter der aktuellen Sparrate liegen.',
      },
      {
        question: 'Wie berechnet sich die Sparquote?',
        answer:
          'Die Sparquote zeigt, welcher Anteil deines monatlichen Nettoeinkommens gespart wird. Sie berechnet sich aus deiner monatlichen Sparrate geteilt durch dein monatliches Nettoeinkommen und wird als Prozentwert dargestellt.',
      },
      {
        question: 'Wie kann ich die Rendite auf meine Anlagen ermitteln?',
        answer:
          'Die Rendite beschreibt, wie stark sich eine Anlage über einen Zeitraum entwickelt. Für eine einfache Einschätzung vergleichst du den aktuellen Wert deiner Anlage mit dem ursprünglich investierten Betrag. Im Finanzplaner kannst du solche Annahmen nutzen, um Prognosen für deine langfristige Vermögensentwicklung zu erstellen.',
      },
    ],
  },
  {
    group: 'Allgemeine Finanzfragen',
    items: [
      {
        question: 'Welche Anlageformen gibt es?',
        answer:
          'Zu den häufigen Anlageformen gehören Tagesgeld, Festgeld, ETFs, Aktien, Anleihen, Fonds, Immobilien und private Vorsorgeprodukte. Tagesgeld und Festgeld gelten eher als sicher und eignen sich gut für Rücklagen, bieten dafür meist geringere Renditechancen. ETFs und Fonds bündeln viele Wertpapiere und können langfristig beim Vermögensaufbau helfen. Einzelaktien bieten höhere Chancen, schwanken aber stärker und brauchen mehr Wissen. Anleihen sind Kredite an Staaten oder Unternehmen und können regelmäßige Zinsen bringen. Immobilien können Stabilität und Mieteinnahmen bieten, erfordern aber viel Kapital und laufende Verwaltung. Private Vorsorgeprodukte können für die Altersvorsorge sinnvoll sein, sollten aber wegen Kosten, Flexibilität und Vertragsbedingungen genau geprüft werden.',
      },
      {
        question: 'Welche Möglichkeiten gibt es zur privaten Rentenvorsorge?',
        answer:
          'Zur privaten Rentenvorsorge zählen zum Beispiel ETF-Sparpläne, private Rentenversicherungen, betriebliche Altersvorsorge, Riester- oder Rürup-Verträge sowie Immobilien. Welche Lösung passt, hängt von Einkommen, Alter, Risikobereitschaft, Flexibilität und deinen langfristigen Zielen ab.',
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
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="3 17 9 11 13 15 21 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold">FinanzPlaner</h1>
            <p className="text-xs text-slate-400">Lebensplanung</p>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Deine Finanzen.<br />
            Dein Leben.<br />
            <span className="text-emerald-500">Geplant.</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-sm">
            Vermögensprojektionen, Ziel-Tracking und KI-Beratung — alles in einer Übersicht.
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
            <h2 className="text-4xl font-bold text-slate-900 mb-3">FAQ</h2>
            <p className="max-w-2xl text-slate-600">
              Hier findest du schnelle Antworten zu den wichtigsten Fragen rund um den Lebens-Finanzplaner.
              Bei weiteren Fragen kannst du auch unseren KI-Assistenten nutzen.
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
