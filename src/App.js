import React from 'react'
import './App.css'

const NameRegex = /\bName\b.*\b[\)$]/
const PriceRegex = /\bPrice\b.*\b[\)$]/

const getSymbolValue = (symbol) => {
  return symbol.substring(symbol.indexOf('(') + 1, symbol.lastIndexOf(')'))
}

async function Name (symbol) {
  const fetchedJson = await fetch(`https://api.coinpaprika.com/v1/coins/${getSymbolValue(symbol)}`).then(r => r.json())
  return fetchedJson['name']
}

const Price = async (symbol) => {
  const fetchedJson = await fetch(`https://api.coinpaprika.com/v1/coins/${getSymbolValue(symbol)}/ohlcv/today/`).then(r => r.json())
  if (fetchedJson[0] && fetchedJson[0].close)
    return fetchedJson[0]['close']
  return fetchedJson
}

async function replaceAsync (str, regex, asyncFn) {
  const promises = []
  str.replace(regex, (match, ...args) => {
    const promise = asyncFn(str.match(regex)[0], ...args)
    promises.push(promise)
  })
  const data = await Promise.all(promises)
  return str.replace(regex, () => data.shift())
}

function App () {
  const [text, setText] = React.useState('')
  const [coinErrorArr, setCoinErrorArr] = React.useState([])

  React.useEffect(() => {

    if (text.match(NameRegex)) {
      replaceAsync(text, NameRegex, Name)
        .then(replacedString => setText(replacedString))
        .catch(err => {
          setText(getSymbolValue(text.match(NameRegex)[0]))
          setCoinErrorArr(Array.of(...coinErrorArr, `Błąd pobierania nazwy dla ${getSymbolValue(text.match(NameRegex)[0])}`))
        })
    }

    if (text.match(PriceRegex)) {
      replaceAsync(text, PriceRegex, Price)
        .then(replacedString => setText(replacedString))
        .catch(err => {
          setText(getSymbolValue(text.match(PriceRegex)[0]))
          setCoinErrorArr(Array.of(...coinErrorArr, `Błąd pobierania ceny dla ${getSymbolValue(text.match(PriceRegex)[0])}`))
        })
    }
  }, [text, coinErrorArr])

  return (
    <div className="App">
      <div className="edit-section">
        <ol>
          <li> Aby skorzystać w edytorze z funkcji Name wpisz Name(podaj id waluty np.btc-bitcoin)</li>
          <li> Aby skorzystać w edytorze z funkcji Price wpisz Price(podaj id waluty np.btc-bitcoin)</li>
          <li> W obecnej aplikacji nie zdążyłem zrobić zabezpieczenia na max 10 req</li>
        </ol>
        <textarea value={text}
                  onChange={(e) => {setText(e.target.value)}}></textarea>
      </div>

      <div className="error">
        {coinErrorArr && coinErrorArr.length > 0 && coinErrorArr.map((item, idx) => {
          return <p key={idx}>{item}</p>
        })}
      </div>

      <pre>
        {text}
      </pre>
    </div>
  )
}

export default App
