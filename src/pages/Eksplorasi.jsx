import Hero from '../sections/Hero'
import EksplorasiHarga from '../sections/EksplorasiHarga'
import CuacaKurs from '../sections/CuacaKurs'
import RekomendasiBand from '../sections/RekomendasiBand'
import RingkasanRiset from '../sections/RingkasanRiset'

export default function Eksplorasi() {
  return (
    <>
      <Hero />
      <section id="eksplorasi"><EksplorasiHarga /></section>
      <section id="cuaca"><CuacaKurs /></section>
      <section id="band"><RekomendasiBand /></section>
      <section id="riset"><RingkasanRiset /></section>
    </>
  )
}
