import { forwardRef } from 'react'
import i18n from '../i18n'
import LightRaysBackground from '../components/reactbits/LightRaysBackground'
import ProfileCard from '../components/reactbits/ProfileCard'
import BlurText from '../components/reactbits/BlurText'
import './ContactPage.css'

export interface ContactPageProps {}

const ContactPage = forwardRef<HTMLElement, ContactPageProps>(function ContactPage(_props, ref) {
  return (
    <section className="contact-section" id="contact" ref={ref}>
      <LightRaysBackground
        className="contact-light-rays"
        raysOrigin="top-center"
        raysColor="#9ac4ff"
        raysSpeed={0.85}
        lightSpread={0.95}
        rayLength={2.1}
        fadeDistance={1.15}
        saturation={1}
        followMouse={false}
        mouseInfluence={0}
        noiseAmount={0.04}
        distortion={0.06}
      />
      <div className="contact-header">
        <div className="contact-header-left">
          <h2>{i18n.t('contact.title')}</h2>
          <span className="contact-line" />
        </div>
        <p className="contact-intro">{i18n.t('contact.intro')}</p>
      </div>
      <div className="contact-card-wrap">
        <ProfileCard
          className="contact-profile-card"
          name={i18n.t('contact.profileName')}
          title={i18n.t('contact.profileTitle')}
          handle="pinkman"
          status={i18n.t('contact.status')}
          contactText={i18n.t('contact.contactButton')}
          showUserInfo={false}
          avatarUrl="/assets/demo/person.webp"
          miniAvatarUrl="/assets/demo/person.webp"
          iconUrl="/assets/demo/iconpattern.png"
          grainUrl="/assets/demo/grain.webp"
          enableMobileTilt
        />
        <div className="contact-card-info">
          <p>{i18n.t('contact.cardTitle')}</p>
          <BlurText text={i18n.t('contact.email')} className="contact-card-info-line" animateBy="letters" />
          <BlurText text={i18n.t('contact.phone')} className="contact-card-info-line" animateBy="letters" />
        </div>
      </div>
    </section>
  )
})

export default ContactPage
