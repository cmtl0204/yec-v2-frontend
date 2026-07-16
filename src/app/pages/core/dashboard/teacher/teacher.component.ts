import {Component, inject} from '@angular/core';
import {Router} from "@angular/router";
import {EnrollmentModel} from "@models/core";
import {BreadcrumbService} from "@services/core";

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.scss']
})
export class TeacherComponent {
  protected transactionMenus: any = [];
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly router = inject(Router);
  protected state: boolean = true;
  protected enrollment!: EnrollmentModel;

  constructor() {
    this.breadcrumbService.setItems([{label: 'Dashboard'}]);
    this.loadMenus();
  }

  loadMenus() {
    const assetsPath = 'assets/images/components/dashboards/teacher';

    this.transactionMenus.push(
      {
        enabled: true,
        code: 'evaluations',
        header: 'Evaluación Docente',
        subheader: 'Gestionar',
        img: `${assetsPath}/teacher-evaluation.png`,
        routerLink: '/core/teacher/teacher-evaluations',
      },
      {
        enabled: true,
        code: 'teacherDistributions',
        header: 'Distributivo Docente',
        subheader: 'Gestionar',
        img: `${assetsPath}/teacher-distribution.png`,
        routerLink: '/core/teacher/teacher-distributions',
      },
      {
        code: 'eva',
        enabled: this.state,
        header: 'EVA',
        subheader: 'EVA',
        img: `${assetsPath}/schedule.png`,
        routerLink: 'https://yec-eva.yavirac.edu.ec',
      },
    );
  }

  redirect(menu: any) {
    if (menu.code === 'eva') {
      const downloadLink = document.createElement('a');
      downloadLink.href = menu.routerLink;
      downloadLink.target = '_blank';
      document.body.appendChild(downloadLink);
      downloadLink.click();
    } else {
      this.router.navigate([menu.routerLink]);
    }
  }
}
