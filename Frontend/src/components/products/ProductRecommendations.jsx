import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { productsAPI, getApiErrorMessage } from '../../api/api'
import { selectCurrentCurrency } from '../../features/preferences/currencySlice'
import { formatCurrencyFromUSD } from '../../utils/currency'
import { getLocalViewedProductIds } from '../../utils/browseSignals'

const ProductRecommendations = ({ anchorProductId }) => {
  const currency = useSelector(selectCurrentCurrency)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!anchorProductId) return undefined

    let cancelled = false
    const viewedIds = getLocalViewedProductIds().filter((id) => id !== String(anchorProductId))

    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await productsAPI.getRecommendations(anchorProductId, {
          limit: 10,
          viewedIds
        })
        if (cancelled) return
        setItems(data?.recommendations || [])
        setMeta(data?.meta || null)
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, 'Could not load recommendations.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [anchorProductId])

  if (loading) {
    return (
      <section className="product-reco" aria-busy="true">
        <div className="product-reco__head">
          <h3 className="product-reco__title">Recommended for you</h3>
          <p className="product-reco__sub">Tuning picks from your catalog…</p>
        </div>
        <div className="product-reco__rail product-reco__rail--skeleton">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="product-reco__skel" />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="product-reco">
        <p className="catalog-error" role="status">
          {error}
        </p>
      </section>
    )
  }

  if (!items.length) return null

  const subtitle = meta?.personalized
    ? 'Blended from your taste, cart signals, and what shoppers pair with this item.'
    : 'Same aisle and similar price to this product — personalization grows as you browse while signed in.'

  return (
    <section className="product-reco">
      <div className="product-reco__head">
        <h3 className="product-reco__title">Recommended for you</h3>
        <p className="product-reco__sub">{subtitle}</p>
      </div>
      <div className="product-reco__rail">
        {items.map((p) => (
          <Link key={p._id} to={`/products/${p._id}`} className="product-reco__card">
            <div className="product-reco__img-wrap">
              <img src={p.image} alt="" className="product-reco__img" loading="lazy" />
            </div>
            <p className="product-reco__name">{p.name}</p>
            <p className="product-reco__price">{formatCurrencyFromUSD(p.price, currency)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default ProductRecommendations
