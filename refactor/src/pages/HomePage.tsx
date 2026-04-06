import HeroSection from '../components/home/HeroSection'
import AboutSection from '../components/home/AboutSection'
import ProjectsSection from '../components/home/ProjectsSection'
import ExperienceSection from '../components/home/ExperienceSection'
import TechStackSection from '../components/home/TechStackSection'
import EducationSection from '../components/home/EducationSection'
import ContactSection from '../components/home/ContactSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <ExperienceSection />
      <TechStackSection />
      <EducationSection />
      <ContactSection />
    </>
  )
}
