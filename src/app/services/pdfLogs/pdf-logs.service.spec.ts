import { TestBed } from '@angular/core/testing';

import { PdfLogsService } from './pdf-logs.service';

describe('PdfLogsService', () => {
  let service: PdfLogsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfLogsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
